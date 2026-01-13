package com.blog.modules.guestbook.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.modules.auth.config.EmailSessionProperties;
import com.blog.modules.auth.util.EmailSessionTokenUtil;
import com.blog.shared.PageResult;
import com.blog.modules.guestbook.event.GuestbookCreatedEvent;
import com.blog.modules.guestbook.mapper.GuestbookMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.modules.guestbook.model.entity.Guestbook;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.modules.guestbook.service.GuestbookPublicService;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.UserAgentUtil;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import com.blog.shared.util.RequestUtil;
import com.blog.shared.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
public class GuestbookPublicServiceImpl implements GuestbookPublicService {
    @Autowired
    private GuestbookMapper guestbookMapper;

    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private MessageVerificationService messageVerificationService;

    @Autowired
    private EmailSessionProperties emailSessionProperties;

    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Override
    public PageResult<GuestbookVO> list(Long page, Long size) {
        String ownerEmail = getOwnerEmailFromRequest();
        Page<Guestbook> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Guestbook> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Guestbook::getDeleted, 0);
        wrapper.and(w -> w.eq(Guestbook::getReviewStatus, 1)
                .or(ownerEmail != null && !ownerEmail.isBlank(), w2 -> w2.eq(Guestbook::getEmail, ownerEmail)));
        wrapper.orderByDesc(Guestbook::getCreateTime);

        Page<Guestbook> result = guestbookMapper.selectPage(pageParam, wrapper);
        List<GuestbookVO> voList = result.getRecords().stream()
                .map(g -> convertToVO(g, ownerEmail))
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    @Transactional
    public GuestbookVO submit(GuestbookDTO dto) {
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BusinessException(400, "Email is required");
        }

        String ownerEmail = getOwnerEmailFromRequest();
        boolean emailVerifiedBySession = ownerEmail != null && ownerEmail.equalsIgnoreCase(dto.getEmail());
        if (!emailVerifiedBySession) {
            if (dto.getEmailCode() == null || dto.getEmailCode().trim().isEmpty()) {
                throw new BusinessException(400, "Email code is required");
            }
            messageVerificationService.validateEmailCode(dto.getEmail(), dto.getEmailCode());
        }

        Guestbook guestbook = BeanUtil.copyProperties(dto, Guestbook.class);

        // Set default values
        guestbook.setIsVisible(1); // Visible by default
        guestbook.setReviewStatus(0); // Pending review

        // Convert images list to JSON string if present
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            guestbook.setImages(JsonUtil.toJson(dto.getImages()));
        }

        // 设置IP和位置信息
        String ip = RequestUtil.getClientIp();
        guestbook.setIp(ip);
        if (locationProviderFactory != null && ip != null) {
            try {
                List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
                LocationInfo locationInfo = null;
                for (LocationProviderPlugin locationProvider : providers) {
                    locationInfo = locationProvider.getLocationInfo(ip);
                    if (locationInfo != null) {
                        break;
                    }
                }
                if (locationInfo != null) {
                    guestbook.setCountry(locationInfo.getCountry());
                    guestbook.setProvince(locationInfo.getProvince());
                    guestbook.setCity(locationInfo.getCity());
                    guestbook.setLatitude(locationInfo.getLatitude());
                    guestbook.setLongitude(locationInfo.getLongitude());
                    guestbook.setLocation(locationInfo.getLocation());
                    if (locationInfo.getIp() != null && !locationInfo.getIp().isEmpty()) {
                        guestbook.setIp(locationInfo.getIp());
                    } else {
                        guestbook.setIp(ip);
                    }
                    guestbook.setLocation(locationInfo.getLocation() != null ? locationInfo.getLocation() :
                            (locationInfo.getProvince() != null && locationInfo.getCity() != null ?
                                    locationInfo.getProvince() + locationInfo.getCity() : null));
                } else {
                    guestbook.setIp(ip);
                }
            } catch (Exception e) {
                log.warn("留言IP定位失败，IP: {}", ip, e);
                guestbook.setIp(ip);
            }
        } else {
            guestbook.setIp(ip);
        }

        // 设置设备和浏览器信息
        String userAgent = RequestUtil.getUserAgent();
        UserAgentInfo userAgentInfo = UserAgentUtil.parse(userAgent);

        // 设置设备信息（设备类型+品牌+型号）
        if (userAgentInfo.getDeviceType() != null) {
            guestbook.setDevice(userAgentInfo.getDeviceDescription());
        } else {
            guestbook.setDevice(userAgent);
        }

        // 设置浏览器信息（浏览器名称+版本）
        if (userAgentInfo.getBrowserName() != null) {
            guestbook.setBrowser(userAgentInfo.getBrowserDescription());
        } else {
            guestbook.setBrowser(userAgent);
        }

        // Save to database
        guestbookMapper.insert(guestbook);
        
        // Convert to VO
        GuestbookVO vo = convertToVO(guestbook, emailVerifiedBySession ? ownerEmail : dto.getEmail());
        
        // Publish event after transaction commit
        if (guestbook.getId() != null) {
            Long guestbookId = guestbook.getId();
            EventUtil.publishEventAfterCommit(() -> {
                // Re-query the latest guestbook data for the event
                Guestbook savedGuestbook = guestbookMapper.selectById(guestbookId);
                if (savedGuestbook != null) {
                    eventPublisher.publishEvent(new GuestbookCreatedEvent(this, guestbookId, savedGuestbook));
                }
            });
        }
        
        return vo;
    }

    private GuestbookVO convertToVO(Guestbook guestbook, String ownerEmail) {
        GuestbookVO vo = BeanUtil.copyProperties(guestbook, GuestbookVO.class);
        if (guestbook.getUserId() != null) {
            User user = userMapper.selectById(guestbook.getUserId());
            if (user != null) {
                vo.setUserName(user.getNickname());
            }
        }
        if (guestbook.getImages() != null && !guestbook.getImages().isEmpty()) {
            try {
                List<String> images = JsonUtil.fromJson(guestbook.getImages(), List.class);
                vo.setImages(images);
            } catch (Exception e) {
                vo.setImages(List.of());
            }
        }

        boolean isOwner = ownerEmail != null && !ownerEmail.isBlank()
                && guestbook.getEmail() != null
                && ownerEmail.equalsIgnoreCase(guestbook.getEmail());
        if (!isOwner && guestbook.getIsVisible() != null && guestbook.getIsVisible() == 0) {
            vo.setContent("");
            vo.setImages(List.of());
        }
        return vo;
    }

    private String getOwnerEmailFromRequest() {
        HttpServletRequest request = RequestUtil.getRequest();
        if (request == null || emailSessionProperties == null) return null;
        String token = request.getHeader(emailSessionProperties.getHeaderName());
        return EmailSessionTokenUtil.getEmail(token, emailSessionProperties);
    }
}


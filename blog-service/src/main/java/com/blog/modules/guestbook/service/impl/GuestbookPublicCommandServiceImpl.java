package com.blog.modules.guestbook.service.impl;



import cn.dev33.satoken.stp.StpUtil;
import com.blog.core.context.UserContext;
import com.blog.modules.guestbook.mapper.GuestbookMapper;
import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.modules.guestbook.model.entity.Guestbook;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.core.plugin.location.LocationInfo;
import com.blog.core.plugin.location.LocationProviderFactory;
import com.blog.core.plugin.location.LocationProviderPlugin;
import com.blog.modules.guestbook.event.GuestbookCreatedEvent;
import com.blog.modules.guestbook.service.GuestbookPublicCommandService;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.JsonUtil;
import com.blog.common.util.KeyUtil;
import com.blog.common.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.List;
@Slf4j
@Service
public class GuestbookPublicCommandServiceImpl implements GuestbookPublicCommandService {
    @Autowired
    private GuestbookMapper guestbookMapper;
    
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public GuestbookVO submit(GuestbookDTO dto) {
        Guestbook guestbook = BeanUtil.copyProperties(dto, Guestbook.class);

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
                log.warn("IP定位失败，IP: {}", ip, e);
                guestbook.setIp(ip);
            }
        } else {
            guestbook.setIp(ip);
        }

        // 设置设备信息
        String userAgent = RequestUtil.getUserAgent();
        guestbook.setDevice(userAgent);

        if (UserContext.isLoggedIn()) {
            Long userId = UserContext.getCurrentUserId();
            guestbook.setUserId(userId);
            guestbook.setType("1");
        } else {
            if (dto.getNickname() != null && !dto.getNickname().isEmpty()) {
                guestbook.setType("2");
            } else {
                guestbook.setType("3");
            }
        }

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            guestbook.setImages(JsonUtil.toJson(dto.getImages()));
        }

        if (guestbook.getIsVisible() == null) {
            guestbook.setIsVisible(1);
        }
        if (guestbook.getReviewStatus() == null) {
            guestbook.setReviewStatus(0);
        }

        guestbookMapper.insert(guestbook);

        Guestbook savedGuestbook = guestbookMapper.selectById(guestbook.getId());
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookCreatedEvent(this, guestbook.getId(), savedGuestbook)));

        GuestbookVO vo = BeanUtil.copyProperties(guestbook, GuestbookVO.class);
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            vo.setImages(dto.getImages());
        }
        return vo;
    }

    private void publishEventAfterCommit(Runnable runnable) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                    runnable.run();
                }
            });
        } else {
            runnable.run();
        }
    }
}


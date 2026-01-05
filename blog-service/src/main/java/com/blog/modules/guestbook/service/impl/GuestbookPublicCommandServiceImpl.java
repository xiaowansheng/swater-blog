package com.blog.modules.guestbook.service.impl;



import com.blog.bootstrap.context.UserContext;
import com.blog.modules.guestbook.mapper.GuestbookMapper;
import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.modules.guestbook.model.entity.Guestbook;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.plugin.components.guestbook.GuestbookProcessorFactory;
import com.blog.plugin.components.guestbook.GuestbookProcessorPlugin;
import com.blog.plugin.core.ProcessResult;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import com.blog.modules.guestbook.event.GuestbookCreatedEvent;
import com.blog.modules.guestbook.service.GuestbookPublicCommandService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.RequestUtil;
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

    @Autowired(required = false)
    private GuestbookProcessorFactory guestbookProcessorFactory;

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

        // 插件化留言处理（清理/审核/防垃圾）
        if (guestbookProcessorFactory != null) {
            try {
                List<GuestbookProcessorPlugin> processors = guestbookProcessorFactory.getProcessors();
                ProcessResult processResult = null;
                for (GuestbookProcessorPlugin processor : processors) {
                    processResult = processor.process(dto);
                    if (processResult != null && processResult.getProcessedContent() != null) {
                        guestbook.setContent(processResult.getProcessedContent());
                    }
                    if (processResult != null && (processResult.isSpam() || !processResult.isApproved())) {
                        guestbook.setReviewStatus(0);
                        break;
                    }
                }
                if (processResult != null && !processResult.isSpam() && processResult.isApproved()) {
                    guestbook.setReviewStatus(1);
                }
            } catch (Exception e) {
                log.warn("留言处理插件执行失败", e);
            }
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


package com.blog.modules.talk.service.impl;



import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.bootstrap.context.UserContext;
import com.blog.modules.talk.event.talk.*;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.dto.TalkDTO;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderFactory;
import com.blog.plugin.location.LocationProviderPlugin;
import com.blog.modules.talk.service.TalkAdminCommandService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.KeyUtil;
import com.blog.shared.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.List;
@Slf4j
@Service
public class TalkAdminCommandServiceImpl implements TalkAdminCommandService {
    private final TalkMapper talkMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    public TalkAdminCommandServiceImpl(TalkMapper talkMapper) {
        this.talkMapper = talkMapper;
    }

    @Override
    @Transactional
    public Long create(TalkDTO dto) {
        Talk talk = BeanUtil.copyProperties(dto, Talk.class);
        talk.setTalkKey(KeyUtil.generateKey("talk"));

        Long userId = UserContext.getCurrentUserId();
        talk.setAuthorId(userId);

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            talk.setImages(JsonUtil.toJson(dto.getImages()));
        }

        talk.setLikeCount(0);
        talk.setCommentCount(0);

        // 设置IP和位置信息
        String ip = RequestUtil.getClientIp();
        talk.setIp(ip);
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
                    talk.setCountry(locationInfo.getCountry());
                    talk.setProvince(locationInfo.getProvince());
                    talk.setCity(locationInfo.getCity());
                    talk.setLatitude(locationInfo.getLatitude());
                    talk.setLongitude(locationInfo.getLongitude());
                    talk.setLocation(locationInfo.getLocation());
                    if (locationInfo.getIp() != null && !locationInfo.getIp().isEmpty()) {
                        talk.setIp(locationInfo.getIp());
                    } else {
                        talk.setIp(ip);
                    }
                    talk.setLocation(locationInfo.getLocation() != null ? locationInfo.getLocation() :
                            (locationInfo.getProvince() != null && locationInfo.getCity() != null ?
                                    locationInfo.getProvince() + locationInfo.getCity() : null));
                } else {
                    talk.setIp(ip);
                }
            } catch (Exception e) {
                log.warn("说说发布IP定位失败，IP: {}", ip, e);
                talk.setIp(ip);
            }
        } else {
            talk.setIp(ip);
        }

        // 设置设备信息
        String userAgent = RequestUtil.getUserAgent();
        talk.setDevice(userAgent);
        
        if (dto.getStatus() == null) {
            talk.setStatus("1");
        }
        if (dto.getIsTop() == null) {
            talk.setIsTop(0);
        }
        
        talkMapper.insert(talk);
        
        Talk savedTalk = talkMapper.selectById(talk.getId());
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new TalkCreatedEvent(this, talk.getId(), savedTalk)));
        
        return talk.getId();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void update(Long id, TalkDTO dto) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }
        
        talk.setContent(dto.getContent());
        talk.setStatus(dto.getStatus());
        talk.setIsTop(dto.getIsTop());
        
        if (dto.getImages() != null) {
            if (dto.getImages().isEmpty()) {
                talk.setImages(null);
            } else {
                talk.setImages(JsonUtil.toJson(dto.getImages()));
            }
        }
        
        talkMapper.updateById(talk);
        
        Talk updatedTalk = talkMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new TalkUpdatedEvent(this, id, updatedTalk)));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void delete(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }
        talkMapper.deleteById(id);
        
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new TalkDeletedEvent(this, id)));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void setTop(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }
        talk.setIsTop(1);
        talkMapper.updateById(talk);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"talk", "talk:list"}, allEntries = true)
    public void cancelTop(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null) {
            throw new BusinessException("说说不存在");
        }
        talk.setIsTop(0);
        talkMapper.updateById(talk);
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


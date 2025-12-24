package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.event.talk.*;
import com.blog.exception.BusinessException;
import com.blog.mapper.TalkMapper;
import com.blog.model.dto.TalkDTO;
import com.blog.model.entity.Talk;
import com.blog.service.TalkAdminCommandService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.KeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class TalkAdminCommandServiceImpl implements TalkAdminCommandService {
    private final TalkMapper talkMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public TalkAdminCommandServiceImpl(TalkMapper talkMapper) {
        this.talkMapper = talkMapper;
    }

    @Override
    @Transactional
    public Long create(TalkDTO dto) {
        Talk talk = BeanUtil.copyProperties(dto, Talk.class);
        talk.setTalkKey(KeyUtil.generateKey("talk"));
        
        Long userId = StpUtil.getLoginIdAsLong();
        talk.setAuthorId(userId);
        
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            talk.setImages(JsonUtil.toJson(dto.getImages()));
        }
        
        talk.setLikeCount(0);
        talk.setCommentCount(0);
        
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
    public void update(Long id, TalkDTO dto) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null || talk.getDeleted() == 1) {
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
    public void delete(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null || talk.getDeleted() == 1) {
            throw new BusinessException("说说不存在");
        }
        talkMapper.deleteById(id);
        
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new TalkDeletedEvent(this, id)));
    }

    @Override
    @Transactional
    public void setTop(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null || talk.getDeleted() == 1) {
            throw new BusinessException("说说不存在");
        }
        talk.setIsTop(1);
        talkMapper.updateById(talk);
    }

    @Override
    @Transactional
    public void cancelTop(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null || talk.getDeleted() == 1) {
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


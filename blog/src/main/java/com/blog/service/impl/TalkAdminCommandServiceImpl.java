package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.TalkMapper;
import com.blog.model.dto.TalkDTO;
import com.blog.model.entity.Talk;
import com.blog.service.TalkAdminCommandService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.KeyUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TalkAdminCommandServiceImpl implements TalkAdminCommandService {
    private final TalkMapper talkMapper;

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
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Talk talk = talkMapper.selectById(id);
        if (talk == null || talk.getDeleted() == 1) {
            throw new BusinessException("说说不存在");
        }
        talkMapper.deleteById(id);
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
}


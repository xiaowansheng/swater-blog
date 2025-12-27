package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.TalkMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.entity.Talk;
import com.blog.model.entity.User;
import com.blog.model.vo.TalkVO;
import com.blog.service.TalkPublicQueryService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TalkPublicQueryServiceImpl implements TalkPublicQueryService {
    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Cacheable(value = "talk:list", key = "#page + ':' + #size")
    public PageResult<TalkVO> list(Long page, Long size) {
        Page<Talk> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Talk> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Talk::getStatus, "1");
        wrapper.eq(Talk::getDeleted, 0);
        wrapper.orderByDesc(Talk::getIsTop);
        wrapper.orderByDesc(Talk::getCreateTime);
        
        Page<Talk> result = talkMapper.selectPage(pageParam, wrapper);
        List<TalkVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    @Cacheable(value = "talk", key = "#id")
    public TalkVO getById(Long id) {
        Talk talk = talkMapper.selectOne(new LambdaQueryWrapper<Talk>()
                .eq(Talk::getId, id)
                .eq(Talk::getStatus, "1")
                .eq(Talk::getDeleted, 0));
        if (talk == null) {
            return null;
        }
        return convertToVO(talk);
    }

    private TalkVO convertToVO(Talk talk) {
        TalkVO vo = BeanUtil.copyProperties(talk, TalkVO.class);
        if (talk.getAuthorId() != null) {
            User user = userMapper.selectById(talk.getAuthorId());
            if (user != null) {
                vo.setAuthorName(user.getNickname());
            }
        }
        if (talk.getImages() != null && !talk.getImages().isEmpty()) {
            try {
                List<String> images = JsonUtil.fromJson(talk.getImages(), List.class);
                vo.setImages(images);
            } catch (Exception e) {
                vo.setImages(List.of());
            }
        }
        return vo;
    }
}


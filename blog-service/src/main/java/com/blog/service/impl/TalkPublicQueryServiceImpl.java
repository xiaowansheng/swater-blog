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
import com.blog.service.PageViewService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TalkPublicQueryServiceImpl implements TalkPublicQueryService {
    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PageViewService pageViewService;

    @Override
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
    public TalkVO getById(Long id) {
        Talk talk = talkMapper.selectOne(new LambdaQueryWrapper<Talk>()
                .eq(Talk::getId, id)
                .eq(Talk::getStatus, "1")
                .eq(Talk::getDeleted, 0));
        if (talk == null) {
            return null;
        }
        try {
            pageViewService.incrementView("3", id);
        } catch (Exception e) {
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


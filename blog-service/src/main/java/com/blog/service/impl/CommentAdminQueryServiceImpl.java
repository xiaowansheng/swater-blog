package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.CommentMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.entity.Comment;
import com.blog.model.entity.User;
import com.blog.model.vo.CommentVO;
import com.blog.service.CommentAdminQueryService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentAdminQueryServiceImpl implements CommentAdminQueryService {
    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<CommentVO> list(Long page, Long size, Integer status, Long targetId, String targetType) {
        Page<Comment> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();

        if (status != null) {
            wrapper.eq(Comment::getStatus, status);
        }
        if (targetId != null) {
            wrapper.eq(Comment::getTargetId, targetId);
        }
        if (targetType != null) {
            wrapper.eq(Comment::getTargetType, targetType);
        }
        wrapper.orderByDesc(Comment::getCreateTime);
        
        Page<Comment> result = commentMapper.selectPage(pageParam, wrapper);
        List<CommentVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public CommentVO getById(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return null;
        }
        return convertToVO(comment);
    }

    private CommentVO convertToVO(Comment comment) {
        CommentVO vo = BeanUtil.copyProperties(comment, CommentVO.class);
        if (comment.getUserId() != null) {
            User user = userMapper.selectById(comment.getUserId());
            if (user != null) {
                vo.setUserName(user.getUsername());
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getAvatar());
            }
        }
        if (comment.getImages() != null && !comment.getImages().isEmpty()) {
            try {
                List<String> images = JsonUtil.fromJson(comment.getImages(), List.class);
                vo.setImages(images);
            } catch (Exception e) {
                vo.setImages(new ArrayList<>());
            }
        }
        return vo;
    }
}


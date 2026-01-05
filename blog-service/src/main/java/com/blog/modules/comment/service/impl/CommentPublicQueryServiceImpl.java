package com.blog.modules.comment.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentPublicQueryService;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.JsonUtil;
import com.blog.common.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class CommentPublicQueryServiceImpl implements CommentPublicQueryService {
    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<CommentVO> list(Long targetId, String targetType, Long page, Long size) {
        Page<Comment> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getStatus, 1);
        wrapper.eq(Comment::getIsVisible, 0);
        
        if (targetId != null) {
            wrapper.eq(Comment::getTargetId, targetId);
        }
        if (targetType != null) {
            wrapper.eq(Comment::getTargetType, targetType);
        }
        wrapper.isNull(Comment::getParentId).or().eq(Comment::getParentId, 0);
        wrapper.orderByDesc(Comment::getCreateTime);
        
        Page<Comment> result = commentMapper.selectPage(pageParam, wrapper);
        List<CommentVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        for (CommentVO vo : voList) {
            loadReplies(vo);
        }
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    private void loadReplies(CommentVO parent) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getStatus, 1);
        wrapper.eq(Comment::getIsVisible, 0);
        wrapper.eq(Comment::getRootId, parent.getId());
        wrapper.orderByAsc(Comment::getCreateTime);
        
        List<Comment> replies = commentMapper.selectList(wrapper);
        List<CommentVO> replyVOs = replies.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        parent.setReplies(replyVOs);
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


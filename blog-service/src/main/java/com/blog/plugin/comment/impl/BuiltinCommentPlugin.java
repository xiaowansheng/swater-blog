package com.blog.plugin.comment.impl;

import com.blog.common.PageResult;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CommentMapper;
import com.blog.mapper.TalkMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.dto.CommentDTO;
import com.blog.model.entity.Article;
import com.blog.model.entity.Comment;
import com.blog.model.entity.Talk;
import com.blog.model.entity.User;
import com.blog.model.vo.CommentVO;
import com.blog.plugin.comment.CommentProviderPlugin;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderFactory;
import com.blog.plugin.location.LocationProviderPlugin;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.KeyUtil;
import com.blog.util.PageUtil;
import com.blog.util.RequestUtil;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@ConditionalOnProperty(name = "comment.provider.type", havingValue = "builtin", matchIfMissing = true)
public class BuiltinCommentPlugin implements CommentProviderPlugin, Plugin {
    
    @Autowired
    private CommentMapper commentMapper;
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private TalkMapper talkMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;
    
    @Override
    public String getName() {
        return "builtin";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    @Transactional
    public CommentVO createComment(CommentDTO dto) throws Exception {
        if (dto.getPostId() == null && dto.getMomentId() == null) {
            throw new IllegalArgumentException("文章ID或说说ID不能同时为空");
        }
        
        if (dto.getPostId() != null && dto.getMomentId() != null) {
            throw new IllegalArgumentException("文章ID和说说ID不能同时存在");
        }
        
        if (dto.getPostId() != null) {
            Article article = articleMapper.selectById(dto.getPostId());
            if (article == null || article.getDeleted() == 1) {
                throw new IllegalArgumentException("文章不存在");
            }
        }
        
        if (dto.getMomentId() != null) {
            Talk talk = talkMapper.selectById(dto.getMomentId());
            if (talk == null || talk.getDeleted() == 1) {
                throw new IllegalArgumentException("说说不存在");
            }
        }
        
        Comment comment = BeanUtil.copyProperties(dto, Comment.class);
        comment.setCommentKey(KeyUtil.generateKey("comment"));
        
        String ip = RequestUtil.getClientIp();
        comment.setIp(ip != null ? ip : "");
        
        if (locationProviderFactory != null && ip != null) {
            try {
                LocationProviderPlugin locationProvider = locationProviderFactory.getProvider();
                if (locationProvider != null) {
                    LocationInfo locationInfo = locationProvider.getLocationInfo(ip);
                    if (locationInfo != null) {
                        comment.setCountry(locationInfo.getCountry());
                        comment.setProvince(locationInfo.getProvince());
                        comment.setCity(locationInfo.getCity());
                        comment.setLatitude(locationInfo.getLatitude());
                        comment.setLongitude(locationInfo.getLongitude());
                        comment.setLocationDetail(locationInfo.getLocationDetail());
                        if (locationInfo.getIpAddress() != null && !locationInfo.getIpAddress().isEmpty()) {
                            comment.setIpAddress(locationInfo.getIpAddress());
                        } else {
                            comment.setIpAddress(ip);
                        }
                        comment.setLocation(locationInfo.getLocationDetail() != null ? locationInfo.getLocationDetail() : 
                                (locationInfo.getProvince() != null && locationInfo.getCity() != null ? 
                                        locationInfo.getProvince() + locationInfo.getCity() : null));
                    } else {
                        comment.setIpAddress(ip);
                    }
                } else {
                    comment.setIpAddress(ip);
                }
            } catch (Exception e) {
                log.warn("IP定位失败，IP: {}", ip, e);
                comment.setIpAddress(ip);
            }
        } else {
            comment.setIpAddress(ip != null ? ip : "");
        }
        
        if (StpUtil.isLogin()) {
            Long userId = StpUtil.getLoginIdAsLong();
            comment.setUserId(userId);
            comment.setType("1");
        } else {
            comment.setType("2");
        }
        
        if (dto.getParentId() != null && dto.getParentId() > 0) {
            Comment parent = commentMapper.selectById(dto.getParentId());
            if (parent == null || parent.getDeleted() == 1) {
                throw new IllegalArgumentException("父评论不存在");
            }
            comment.setParentId(dto.getParentId());
            comment.setRootId(parent.getRootId() != null && parent.getRootId() > 0 ? parent.getRootId() : parent.getId());
        } else {
            comment.setParentId(0L);
            comment.setRootId(0L);
        }
        
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            comment.setImages(JsonUtil.toJson(dto.getImages()));
        } else {
            comment.setImages("[]");
        }
        
        comment.setStatus(0);
        comment.setIsVisible(0);
        
        commentMapper.insert(comment);
        
        if (dto.getPostId() != null) {
            Article article = articleMapper.selectById(dto.getPostId());
            article.setCommentCount((article.getCommentCount() != null ? article.getCommentCount() : 0) + 1);
            articleMapper.updateById(article);
        }
        
        if (dto.getMomentId() != null) {
            Talk talk = talkMapper.selectById(dto.getMomentId());
            talk.setCommentCount((talk.getCommentCount() != null ? talk.getCommentCount() : 0) + 1);
            talkMapper.updateById(talk);
        }
        
        Comment savedComment = commentMapper.selectById(comment.getId());
        return convertToVO(savedComment);
    }
    
    @Override
    public PageResult<CommentVO> getComments(Long postId, Long momentId, Long page, Long size) throws Exception {
        Page<Comment> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getDeleted, 0);
        wrapper.eq(Comment::getStatus, 1);
        wrapper.eq(Comment::getIsVisible, 0);
        
        if (postId != null) {
            wrapper.eq(Comment::getPostId, postId);
        }
        if (momentId != null) {
            wrapper.eq(Comment::getMomentId, momentId);
        }
        wrapper.isNull(Comment::getParentId).or().eq(Comment::getParentId, 0);
        wrapper.orderByDesc(Comment::getCreateTime);
        
        Page<Comment> result = commentMapper.selectPage(pageParam, wrapper);
        List<CommentVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }
    
    @Override
    public CommentVO getCommentById(Long id) throws Exception {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getDeleted() == 1) {
            return null;
        }
        return convertToVO(comment);
    }
    
    @Override
    @Transactional
    public void deleteComment(Long id) throws Exception {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getDeleted() == 1) {
            return;
        }
        commentMapper.deleteById(id);
    }
    
    @Override
    @Transactional
    public void approveComment(Long id, boolean approved) throws Exception {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getDeleted() == 1) {
            throw new IllegalArgumentException("评论不存在");
        }
        comment.setStatus(approved ? 1 : 0);
        commentMapper.updateById(comment);
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


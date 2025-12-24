package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
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
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderFactory;
import com.blog.plugin.location.LocationProviderPlugin;
import com.blog.service.CommentPublicCommandService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.KeyUtil;
import com.blog.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CommentPublicCommandServiceImpl implements CommentPublicCommandService {
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
    @Transactional
    public CommentVO create(CommentDTO dto) {
        if (dto.getPostId() == null && dto.getMomentId() == null) {
            throw new BusinessException("文章ID或说说ID不能同时为空");
        }
        
        if (dto.getPostId() != null && dto.getMomentId() != null) {
            throw new BusinessException("文章ID和说说ID不能同时存在");
        }
        
        if (dto.getPostId() != null) {
            Article article = articleMapper.selectById(dto.getPostId());
            if (article == null || article.getDeleted() == 1) {
                throw new BusinessException("文章不存在");
            }
        }
        
        if (dto.getMomentId() != null) {
            Talk talk = talkMapper.selectById(dto.getMomentId());
            if (talk == null || talk.getDeleted() == 1) {
                throw new BusinessException("说说不存在");
            }
        }
        
        Comment comment = BeanUtil.copyProperties(dto, Comment.class);
        comment.setCommentKey(KeyUtil.generateKey("comment"));
        
        String ip = RequestUtil.getClientIp();
        comment.setIp(ip != null ? ip : "");
        
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
                throw new BusinessException("父评论不存在");
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


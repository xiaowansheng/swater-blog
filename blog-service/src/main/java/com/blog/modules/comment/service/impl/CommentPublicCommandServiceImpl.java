package com.blog.modules.comment.service.impl;



import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.bootstrap.context.UserContext;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderFactory;
import com.blog.plugin.location.LocationProviderPlugin;
import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.modules.comment.service.CommentPublicCommandService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.KeyUtil;
import com.blog.shared.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
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

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public CommentVO create(CommentDTO dto) {
        if (dto.getTargetId() == null || dto.getTargetType() == null) {
            throw new BusinessException("目标ID和目标类型不能为空");
        }
        
        if ("ARTICLE".equalsIgnoreCase(dto.getTargetType())) {
            Article article = articleMapper.selectById(dto.getTargetId());
            if (article == null) {
                throw new BusinessException("文章不存在");
            }
        } else if ("TALK".equalsIgnoreCase(dto.getTargetType())) {
            Talk talk = talkMapper.selectById(dto.getTargetId());
            if (talk == null) {
                throw new BusinessException("说说不存在");
            }
        } else {
            throw new BusinessException("不支持的目标类型: " + dto.getTargetType());
        }
        
        Comment comment = BeanUtil.copyProperties(dto, Comment.class);

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
                    comment.setCountry(locationInfo.getCountry());
                    comment.setProvince(locationInfo.getProvince());
                    comment.setCity(locationInfo.getCity());
                    comment.setLatitude(locationInfo.getLatitude());
                    comment.setLongitude(locationInfo.getLongitude());
                    comment.setLocation(locationInfo.getLocation());
                    if (locationInfo.getIp() != null && !locationInfo.getIp().isEmpty()) {
                        comment.setIp(locationInfo.getIp());
                    } else {
                        comment.setIp(ip);
                    }
                    comment.setLocation(locationInfo.getLocation() != null ? locationInfo.getLocation() : 
                            (locationInfo.getProvince() != null && locationInfo.getCity() != null ? 
                                    locationInfo.getProvince() + locationInfo.getCity() : null));
                } else {
                    comment.setIp(ip);
                }
            } catch (Exception e) {
                log.warn("IP定位失败，IP: {}", ip, e);
                comment.setIp(ip);
            }
        } else {
            comment.setIp(ip != null ? ip : "");
        }

        // 设置设备信息
        String userAgent = RequestUtil.getUserAgent();
        comment.setDevice(userAgent);

        if (UserContext.isLoggedIn()) {
            Long userId = UserContext.getCurrentUserId();
            comment.setUserId(userId);
            comment.setType("1");
        } else {
            comment.setType("2");
        }

        if (dto.getParentId() != null && dto.getParentId() > 0) {
            Comment parent = commentMapper.selectById(dto.getParentId());
            if (parent == null) {
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
        
        Comment savedComment = commentMapper.selectById(comment.getId());
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentCreatedEvent(this, comment.getId(), savedComment)));
        
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


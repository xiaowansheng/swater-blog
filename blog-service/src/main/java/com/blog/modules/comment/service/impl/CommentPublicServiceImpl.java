package com.blog.modules.comment.service.impl;


import com.blog.shared.PageResult;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentPublicService;
import com.blog.plugin.components.comment.CommentProviderFactory;
import com.blog.plugin.components.comment.CommentProviderPlugin;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.UserAgentUtil;
import com.blog.shared.util.RequestUtil;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.talk.model.entity.Talk;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.List;

@Slf4j
@Service
public class CommentPublicServiceImpl implements CommentPublicService {
    @Autowired(required = false)
    private CommentProviderFactory commentProviderFactory;

    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private MessageVerificationService messageVerificationService;

    @Override
    @Transactional
    public CommentVO create(CommentDTO dto) {
        // 验证评论目标
        validateCommentTarget(dto);

        // 验证邮箱验证码
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BusinessException(400, "Email is required");
        }
        if (dto.getCaptcha() == null || dto.getCaptcha().trim().isEmpty()) {
            throw new BusinessException(400, "Email verification code is required");
        }
        messageVerificationService.validateEmailCode(dto.getEmail(), dto.getCaptcha());

        if (commentProviderFactory == null) {
            throw new BusinessException("未配置评论插件工厂");
        }
        CommentProviderPlugin provider = commentProviderFactory.getActiveProvider();
        if (provider == null) {
            throw new BusinessException("没有可用的评论插件");
        }

        // 设置IP和位置信息
        String ip = RequestUtil.getClientIp();
        dto.setIp(ip);
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
                    dto.setCountry(locationInfo.getCountry());
                    dto.setProvince(locationInfo.getProvince());
                    dto.setCity(locationInfo.getCity());
                    dto.setLatitude(locationInfo.getLatitude());
                    dto.setLongitude(locationInfo.getLongitude());
                    dto.setLocation(locationInfo.getLocation());
                    if (locationInfo.getIp() != null && !locationInfo.getIp().isEmpty()) {
                        dto.setIp(locationInfo.getIp());
                    } else {
                        dto.setIp(ip);
                    }
                    dto.setLocation(locationInfo.getLocation() != null ? locationInfo.getLocation() :
                            (locationInfo.getProvince() != null && locationInfo.getCity() != null ?
                                    locationInfo.getProvince() + locationInfo.getCity() : null));
                } else {
                    dto.setIp(ip);
                }
            } catch (Exception e) {
                log.warn("评论IP定位失败，IP: {}", ip, e);
                dto.setIp(ip);
            }
        } else {
            dto.setIp(ip);
        }

        // 设置设备和浏览器信息
        String userAgent = RequestUtil.getUserAgent();
        UserAgentInfo userAgentInfo = UserAgentUtil.parse(userAgent);

        // 设置设备信息（设备类型+品牌+型号）
        if (userAgentInfo.getDeviceType() != null) {
            dto.setDevice(userAgentInfo.getDeviceDescription());
        } else {
            dto.setDevice(userAgent);
        }

        // 设置浏览器信息（浏览器名称+版本）
        if (userAgentInfo.getBrowserName() != null) {
            dto.setBrowser(userAgentInfo.getBrowserDescription());
        } else {
            dto.setBrowser(userAgent);
        }

        CommentVO vo;
        try {
            vo = provider.createComment(dto);
        } catch (Exception e) {
            throw new BusinessException("评论创建失败: " + e.getMessage());
        }

        Long commentId = vo != null ? vo.getId() : null;
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentCreatedEvent(this, commentId, null)));
        return vo;
    }

    @Override
    public PageResult<CommentVO> list(Long targetId, String targetType, Long page, Long size) {
        CommentProviderPlugin provider = getProvider();
        try {
            return provider.getComments(targetId, targetType, page, size);
        } catch (Exception e) {
            throw new BusinessException("获取评论失败: " + e.getMessage());
        }
    }

    private CommentProviderPlugin getProvider() {
        if (commentProviderFactory == null) {
            throw new BusinessException("未配置评论插件工厂");
        }
        CommentProviderPlugin provider = commentProviderFactory.getActiveProvider();
        if (provider == null) {
            throw new BusinessException("没有可用的评论插件");
        }
        return provider;
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
    
    /**
     * 验证评论目标
     */
    private void validateCommentTarget(CommentDTO dto) {
        if (dto.getTargetId() == null || dto.getTargetType() == null) {
            throw new BusinessException("评论目标ID和类型不能为空");
        }
        
        if ("ARTICLE".equalsIgnoreCase(dto.getTargetType())) {
            Article article = articleMapper.selectById(dto.getTargetId());
            if (article == null || article.getDeleted() == 1) {
                throw new BusinessException("文章不存在");
            }
        } else if ("TALK".equalsIgnoreCase(dto.getTargetType())) {
            Talk talk = talkMapper.selectById(dto.getTargetId());
            if (talk == null || talk.getDeleted() == 1) {
                throw new BusinessException("说说不存在");
            }
        } else {
            throw new BusinessException("不支持的评论目标类型: " + dto.getTargetType());
        }
    }
}


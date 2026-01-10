package com.blog.modules.comment.service.impl;


import com.blog.shared.PageResult;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentPublicService;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.UserAgentUtil;
import com.blog.shared.util.RequestUtil;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.user.model.entity.User;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import cn.dev33.satoken.stp.StpUtil;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CommentPublicServiceImpl implements CommentPublicService {
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private ArticleMapper articleMapper;
    
    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private UserMapper userMapper;

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

        CommentVO vo = createAndPersist(dto);

        Long commentId = vo != null ? vo.getId() : null;
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentCreatedEvent(this, commentId, null)));
        return vo;
    }

    @Override
    public PageResult<CommentVO> list(Long targetId, String targetType, Long page, Long size) {
        return list(targetId, targetType, null, null, null, null, page, size);
    }

    @Override
    public PageResult<CommentVO> list(Long targetId, String targetType, Long parentId, Long rootId, String sort, String ownerToken, Long page, Long size) {
        Page<Comment> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getDeleted, 0);
        wrapper.and(w -> w
                .eq(Comment::getStatus, 1).eq(Comment::getIsVisible, 0)
                .or(ownerToken != null && !ownerToken.isEmpty(), w2 -> w2.eq(Comment::getOwnerToken, ownerToken)));

        if (targetId != null) {
            wrapper.eq(Comment::getTargetId, targetId);
        }
        if (targetType != null) {
            wrapper.eq(Comment::getTargetType, targetType);
        }
        if (rootId != null) {
            wrapper.eq(Comment::getRootId, rootId);
        }

        // 当 rootId 存在时，按整棵楼层返回，不再按 parentId 过滤单层
        if (rootId == null && parentId != null) {
            wrapper.eq(Comment::getParentId, parentId);
        }

        if ("time".equalsIgnoreCase(sort) || sort == null || sort.isEmpty()) {
            wrapper.orderByDesc(Comment::getCreateTime);
        } else {
            wrapper.orderByDesc(Comment::getCreateTime);
        }

        Page<Comment> result = commentMapper.selectPage(pageParam, wrapper);
        List<Comment> records = result.getRecords();

        List<Long> idsNeedingCount = new ArrayList<>();
        // 仅顶级列表时需要统计子回复数量；按 rootId 查询全楼层时不统计
        if ((parentId == null || parentId == 0) && rootId == null) {
            idsNeedingCount = records.stream().map(Comment::getId).collect(java.util.stream.Collectors.toList());
        }

        List<CommentVO> voList = new ArrayList<>();
        for (Comment c : records) {
            boolean withCount = idsNeedingCount.contains(c.getId());
            voList.add(convertToVO(c, ownerToken, withCount));
        }

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
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

    private CommentVO createAndPersist(CommentDTO dto) {
        // 文本处理插件已移除，后续可在此处添加敏感词校验等逻辑

        Comment comment = BeanUtil.copyProperties(dto, Comment.class);

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
            Long rootId = dto.getRootId();
            if (rootId == null || rootId == 0) {
                rootId = parent.getRootId() != null && parent.getRootId() > 0 ? parent.getRootId() : parent.getId();
            }
            comment.setRootId(rootId);
        } else {
            comment.setParentId(0L);
            comment.setRootId(0L); // will be updated after insert
        }

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            comment.setImages(JsonUtil.toJson(dto.getImages()));
        } else {
            comment.setImages("[]");
        }
        comment.setOwnerToken(dto.getOwnerToken());
        comment.setIsVisible(0);

        // 默认待审核；如需通过审核，可在此处加入自定义规则
        if (comment.getStatus() == null) {
            comment.setStatus(0);
        }

        commentMapper.insert(comment);

        // 如果是顶级评论，插入后更新 rootId=自身ID
        if (comment.getParentId() == 0) {
            comment.setRootId(comment.getId());
            commentMapper.updateById(comment);
        }

        if ("ARTICLE".equalsIgnoreCase(dto.getTargetType())) {
            Article article = articleMapper.selectById(dto.getTargetId());
            article.setCommentCount((article.getCommentCount() != null ? article.getCommentCount() : 0) + 1);
            articleMapper.updateById(article);
        } else if ("TALK".equalsIgnoreCase(dto.getTargetType())) {
            Talk talk = talkMapper.selectById(dto.getTargetId());
            talk.setCommentCount((talk.getCommentCount() != null ? talk.getCommentCount() : 0) + 1);
            talkMapper.updateById(talk);
        }

        Comment savedComment = commentMapper.selectById(comment.getId());
        return convertToVO(savedComment, dto.getOwnerToken(), false);
    }

    private CommentVO convertToVO(Comment comment, String ownerToken, boolean withReplyCount) {
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
        vo.setIsOwner(ownerToken != null && !ownerToken.isEmpty() && ownerToken.equals(comment.getOwnerToken()));

        if (withReplyCount) {
            LambdaQueryWrapper<Comment> countWrapper = new LambdaQueryWrapper<>();
            countWrapper.eq(Comment::getDeleted, 0);
            countWrapper.eq(Comment::getRootId, comment.getId());
            countWrapper.ne(Comment::getParentId, 0);
            countWrapper.and(w -> w.eq(Comment::getStatus, 1).eq(Comment::getIsVisible, 0)
                    .or(ownerToken != null && !ownerToken.isEmpty(), w2 -> w2.eq(Comment::getOwnerToken, ownerToken)));
            Long count = commentMapper.selectCount(countWrapper);
            vo.setReplyCount(count != null ? count.intValue() : 0);
        }
        return vo;
    }
}

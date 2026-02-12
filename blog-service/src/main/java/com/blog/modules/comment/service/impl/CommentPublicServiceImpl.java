package com.blog.modules.comment.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.auth.config.EmailSessionProperties;
import com.blog.modules.auth.util.EmailSessionTokenUtil;
import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.service.CommentPublicService;
import com.blog.modules.file.service.FileService;
import com.blog.modules.file.mapper.FileMetaMapper;
import com.blog.modules.file.model.entity.FileMeta;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.user.model.entity.User;
import com.blog.shared.PageResult;
import com.blog.shared.SensitiveWordHelper;
import com.blog.shared.exception.BusinessException;
import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import com.blog.shared.util.RequestUtil;
import com.blog.shared.util.UserAgentUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CommentPublicServiceImpl implements CommentPublicService {
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

    @Autowired
    private EmailSessionProperties emailSessionProperties;

    @Autowired
    private FileService fileService;

    @Autowired
    private FileMetaMapper fileMetaMapper;

    @Autowired
    private SensitiveWordHelper sensitiveWordHelper;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Override
    public CommentVO create(CommentDTO dto) {
        validateCommentTarget(dto);

        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BusinessException(400, "Email is required");
        }

        String sessionEmail = getOwnerEmailFromRequest();
        boolean emailVerifiedBySession = sessionEmail != null && sessionEmail.equalsIgnoreCase(dto.getEmail());
        if (!emailVerifiedBySession) {
            if (dto.getCaptcha() == null || dto.getCaptcha().trim().isEmpty()) {
                throw new BusinessException(400, "Email verification code is required");
            }
            messageVerificationService.validateEmailCode(dto.getEmail(), dto.getCaptcha());
        }

        String ip = RequestUtil.getClientIp();
        dto.setIp(ip);

        String userAgent = RequestUtil.getUserAgent();
        UserAgentInfo userAgentInfo = UserAgentUtil.parse(userAgent);
        dto.setDevice(userAgentInfo.getDeviceDescription() != null ? userAgentInfo.getDeviceDescription() : userAgent);
        dto.setBrowser(userAgentInfo.getBrowserDescription() != null ? userAgentInfo.getBrowserDescription() : userAgent);

        String ownerEmailForView = emailVerifiedBySession ? sessionEmail : dto.getEmail();
        return transactionTemplate.execute(status -> {
            CommentVO vo = createAndPersist(dto, ownerEmailForView);
            if (vo != null && vo.getId() != null) {
                Long commentId = vo.getId();
                EventUtil.publishEventAfterCommit(() -> {
                    // 在事件发布时重新查询最新的评论数据
                    Comment comment = commentMapper.selectById(commentId);
                    if (comment != null) {
                        eventPublisher.publishEvent(new CommentCreatedEvent(this, commentId, comment));
                    }
                });
            }
            return vo;
        });
    }

    @Override
    public PageResult<CommentVO> list(
            Long targetId,
            String targetType,
            Long parentId,
            Long rootId,
            String sort,
            String order,
            Long page,
            Long size
    ) {
        String ownerEmail = getOwnerEmailFromRequest();
        boolean hasOwnerEmail = ownerEmail != null && !ownerEmail.isBlank();

        Page<Comment> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getDeleted, 0);
        // 公开：所有 status=1 的评论都返回（包含 is_visible=0 的隐藏评论，内容会在 VO 里被置空）
        // 私有：若携带邮箱会话 token，则额外返回该邮箱自己的非公开评论（例如待审核）
        wrapper.and(w -> w.eq(Comment::getStatus, 1)
                .or(hasOwnerEmail, w2 -> w2.eq(Comment::getEmail, ownerEmail)));

        if (targetId != null) {
            wrapper.eq(Comment::getTargetId, targetId);
        }
        if (targetType != null) {
            wrapper.eq(Comment::getTargetType, targetType);
        }

        if (rootId != null && rootId > 0) {
            wrapper.eq(Comment::getRootId, rootId);
            wrapper.ne(Comment::getParentId, 0); // exclude root comment itself
        } else if (parentId != null) {
            wrapper.eq(Comment::getParentId, parentId);
        }

        boolean isReplyList = rootId != null && rootId > 0;
        if ("time".equalsIgnoreCase(sort) || sort == null || sort.isEmpty()) {
            if (isReplyList) {
                wrapper.orderByAsc(Comment::getCreateTime);
            } else if ("asc".equalsIgnoreCase(order) || "oldest".equalsIgnoreCase(order)) {
                wrapper.orderByAsc(Comment::getCreateTime);
            } else {
                wrapper.orderByDesc(Comment::getCreateTime);
            }
        } else {
            wrapper.orderByDesc(Comment::getCreateTime);
        }

        Page<Comment> result = commentMapper.selectPage(pageParam, wrapper);
        List<Comment> records = result.getRecords();

        Set<Long> idsNeedingCount = Set.of();
        if ((parentId == null || parentId == 0) && (rootId == null || rootId == 0)) {
            idsNeedingCount = records.stream().map(Comment::getId).collect(Collectors.toSet());
        }

        Map<Long, User> userMap = Map.of();
        List<Long> userIds = records.stream()
                .map(Comment::getUserId)
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (!userIds.isEmpty()) {
            userMap = userMapper.selectBatchIds(userIds).stream()
                    .collect(Collectors.toMap(User::getId, u -> u));
        }

        Map<Long, Integer> replyCountMap = Map.of();
        if (!idsNeedingCount.isEmpty()) {
            QueryWrapper<Comment> countWrapper = new QueryWrapper<>();
            countWrapper.select("root_id", "COUNT(*) AS cnt");
            countWrapper.in("root_id", idsNeedingCount);
            countWrapper.ne("parent_id", 0);
            countWrapper.and(w -> w.eq("status", 1)
                    .or(hasOwnerEmail, w2 -> w2.eq("email", ownerEmail)));
            countWrapper.groupBy("root_id");
            List<Map<String, Object>> rows = commentMapper.selectMaps(countWrapper);
            Map<Long, Integer> counts = new HashMap<>();
            for (Map<String, Object> row : rows) {
                Object rootIdObj = row.get("root_id");
                Object cntObj = row.get("cnt");
                if (rootIdObj instanceof Number) {
                    long rootCommentId = ((Number) rootIdObj).longValue();
                    int cnt = cntObj instanceof Number ? ((Number) cntObj).intValue() : 0;
                    counts.put(rootCommentId, cnt);
                }
            }
            replyCountMap = counts;
        }

        List<CommentVO> voList = new ArrayList<>();
        for (Comment c : records) {
            boolean withCount = idsNeedingCount.contains(c.getId());
            voList.add(convertToVO(c, ownerEmail, withCount, userMap, replyCountMap));
        }

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

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

    private CommentVO createAndPersist(CommentDTO dto, String ownerEmailForView) {
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
            Long resolvedRootId = dto.getRootId();
            if (resolvedRootId == null || resolvedRootId == 0) {
                resolvedRootId = (parent.getRootId() != null && parent.getRootId() > 0) ? parent.getRootId() : parent.getId();
            }
            comment.setRootId(resolvedRootId);
        } else {
            comment.setParentId(0L);
            comment.setRootId(0L); // updated after insert
        }

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            comment.setImages(JsonUtil.toJson(dto.getImages()));
        } else {
            comment.setImages("[]");
        }

        // 敏感词检测：如果包含敏感词则需要审核，否则自动通过
        if (sensitiveWordHelper.contains(comment.getContent())) {
            // 包含敏感词：需要审核，不可见
            comment.setStatus(0);  // 待审核
            comment.setIsVisible(0);  // 不可见
            log.info("评论包含敏感词，ID: {}, 需要人工审核", comment.getId());
        } else {
            // 无敏感词：自动审核通过，可见
            comment.setStatus(1);  // 审核通过
            comment.setIsVisible(1);  // 可见
        }

        commentMapper.insert(comment);

        // 处理文件引用关系：验证前端提交的引用列表
        if (dto.getReferencedFileIds() != null && !dto.getReferencedFileIds().isEmpty()) {
            List<Long> validFileIds = findValidReferencedFileIds(
                    dto.getReferencedFileIds(),
                    dto.getContent(),
                    dto.getImages()
            );
            // 只为在内容中找到的文件建立引用关系
            if (!validFileIds.isEmpty()) {
                fileService.addReferences(validFileIds, "COMMENT", comment.getId());
            }
        }

        if (comment.getParentId() == 0) {
            comment.setRootId(comment.getId());
            commentMapper.updateById(comment);
        }

        Comment savedComment = commentMapper.selectById(comment.getId());
        return convertToVO(savedComment, ownerEmailForView, false);
    }

    /**
     * 从前端提交的文件ID里筛出确实在评论内容中使用的文件
     * @param referencedFileIds 前端提交的文件ID列表
     * @param content 评论内容
     * @param images 图片列表
     * @return 有效的文件ID列表
     */
    private List<Long> findValidReferencedFileIds(List<Long> referencedFileIds, String content, List<String> images) {
        List<Long> uniqueIds = referencedFileIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (uniqueIds.isEmpty()) {
            return List.of();
        }

        List<FileMeta> files = fileMetaMapper.selectBatchIds(uniqueIds);
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        List<Long> validIds = new ArrayList<>();
        for (FileMeta fileMeta : files) {
            if (isFileInComment(fileMeta, content, images)) {
                validIds.add(fileMeta.getId());
            }
        }
        return validIds;
    }

    private boolean isFileInComment(FileMeta fileMeta, String content, List<String> images) {
        if (fileMeta == null) {
            return false;
        }

        String fileUrl = fileMeta.getUrl();
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        // 检查是否在内容中
        if (content != null && content.contains(fileUrl)) {
            return true;
        }

        // 检查是否在图片列表中
        if (images != null && !images.isEmpty()) {
            for (String imageUrl : images) {
                if (imageUrl != null && imageUrl.contains(fileUrl)) {
                    return true;
                }
            }
        }

        return false;
    }

    private CommentVO convertToVO(Comment comment, String ownerEmail, boolean withReplyCount) {
        return convertToVO(comment, ownerEmail, withReplyCount, null, null);
    }

    private CommentVO convertToVO(
            Comment comment,
            String ownerEmail,
            boolean withReplyCount,
            Map<Long, User> userMap,
            Map<Long, Integer> replyCountMap
    ) {
        CommentVO vo = BeanUtil.copyProperties(comment, CommentVO.class);
        if (comment.getUserId() != null) {
            User user = userMap != null
                    ? userMap.get(comment.getUserId())
                    : userMapper.selectById(comment.getUserId());
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

        boolean isOwner = ownerEmail != null && !ownerEmail.isBlank()
                && comment.getEmail() != null
                && ownerEmail.equalsIgnoreCase(comment.getEmail());
        vo.setIsOwner(isOwner);

        // 隐藏评论：非发布者仍返回记录，但内容/图片置空，前端用 isVisible=0 渲染“已被隐藏”提示
        if (!isOwner && comment.getIsVisible() != null && comment.getIsVisible() == 0) {
            vo.setContent("");
            vo.setImages(new ArrayList<>());
        }

        if (withReplyCount) {
            if (replyCountMap != null) {
                vo.setReplyCount(replyCountMap.getOrDefault(comment.getId(), 0));
                return vo;
            }
            LambdaQueryWrapper<Comment> countWrapper = new LambdaQueryWrapper<>();
            countWrapper.eq(Comment::getRootId, comment.getId());
            countWrapper.ne(Comment::getParentId, 0);
            countWrapper.and(w -> w.eq(Comment::getStatus, 1)
                    .or(ownerEmail != null && !ownerEmail.isBlank(), w2 -> w2.eq(Comment::getEmail, ownerEmail)));
            Long count = commentMapper.selectCount(countWrapper);
            vo.setReplyCount(count != null ? count.intValue() : 0);
        }

        return vo;
    }

    private String getOwnerEmailFromRequest() {
        HttpServletRequest request = RequestUtil.getRequest();
        if (request == null || emailSessionProperties == null) return null;
        String token = request.getHeader(emailSessionProperties.getHeaderName());
        return EmailSessionTokenUtil.getEmail(token, emailSessionProperties);
    }
}


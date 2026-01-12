package com.blog.modules.statistics.track.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.statistics.track.mapper.ContentLikeStateMapper;
import com.blog.modules.statistics.track.mapper.ContentMetricEventMapper;
import com.blog.modules.statistics.track.model.dto.ContentLikeActionDTO;
import com.blog.modules.statistics.track.model.entity.ContentLikeState;
import com.blog.modules.statistics.track.model.entity.ContentMetricEvent;
import com.blog.modules.statistics.track.model.vo.ContentLikeResultVO;
import com.blog.modules.statistics.track.model.vo.ContentLikeStatusVO;
import com.blog.modules.statistics.track.service.ContentLikeService;
import com.blog.modules.statistics.visitor.mapper.VisitorMapper;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.shared.exception.BusinessException;
import com.blog.shared.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
public class ContentLikeServiceImpl implements ContentLikeService {
    @Autowired
    private VisitorMapper visitorMapper;

    @Autowired
    private ContentLikeStateMapper contentLikeStateMapper;

    @Autowired
    private ContentMetricEventMapper contentMetricEventMapper;

    @Autowired(required = false)
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private TalkMapper talkMapper;

    @Override
    @Transactional
    public ContentLikeResultVO action(ContentLikeActionDTO dto, HttpServletRequest request) {
        ContentLikeActionDTO safe = dto != null ? dto : new ContentLikeActionDTO();
        LocalDateTime now = LocalDateTime.now();

        String ip = RequestUtil.getClientIp(request);
        String visitorUuid = StringUtils.hasText(safe.getVisitorUuid()) ? safe.getVisitorUuid() : UUID.randomUUID().toString();
        Visitor visitor = resolveVisitor(visitorUuid, ip, now);

        String contentType = normalizeContentType(safe.getContentType());
        Long contentId = safe.getContentId();
        if (contentId == null) {
            throw new BusinessException(400, "contentId is required");
        }

        String action = StringUtils.hasText(safe.getAction()) ? safe.getAction().trim().toUpperCase() : "TOGGLE";

        boolean changed;
        boolean liked;

        if ("LIKE".equals(action) || "TOGGLE".equals(action)) {
            LikeAttempt attempt = like(visitor.getId(), contentType, contentId, now);
            changed = attempt.changed;
            liked = attempt.liked;
            if ("TOGGLE".equals(action) && !liked) {
                LikeAttempt unAttempt = unlike(visitor.getId(), contentType, contentId, now);
                changed = changed || unAttempt.changed;
                liked = unAttempt.liked;
            }
        } else if ("UNLIKE".equals(action)) {
            LikeAttempt attempt = unlike(visitor.getId(), contentType, contentId, now);
            changed = attempt.changed;
            liked = attempt.liked;
        } else {
            throw new BusinessException(400, "Invalid action: " + safe.getAction());
        }

        Long likeCount = getContentLikeCount(contentType, contentId);

        ContentLikeResultVO vo = new ContentLikeResultVO();
        vo.setVisitorUuid(visitor.getVisitorUuid());
        vo.setLiked(liked);
        vo.setLikeCount(likeCount != null ? likeCount : 0L);
        return vo;
    }

    @Override
    public ContentLikeStatusVO status(String visitorUuid, String contentType, Long contentId) {
        if (!StringUtils.hasText(visitorUuid) || !StringUtils.hasText(contentType) || contentId == null) {
            ContentLikeStatusVO vo = new ContentLikeStatusVO();
            vo.setLiked(false);
            vo.setLikeCount(0L);
            return vo;
        }

        Visitor visitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                .eq(Visitor::getVisitorUuid, visitorUuid)
                .eq(Visitor::getDeleted, 0)
                .last("LIMIT 1"));

        boolean liked = false;
        if (visitor != null) {
            ContentLikeState state = contentLikeStateMapper.selectOne(new LambdaQueryWrapper<ContentLikeState>()
                    .eq(ContentLikeState::getVisitorId, visitor.getId())
                    .eq(ContentLikeState::getContentType, normalizeContentType(contentType))
                    .eq(ContentLikeState::getContentId, contentId)
                    .eq(ContentLikeState::getDeleted, 0)
                    .last("LIMIT 1"));
            liked = state != null && state.getLiked() != null && state.getLiked() == 1;
        }

        Long likeCount = getContentLikeCount(normalizeContentType(contentType), contentId);

        ContentLikeStatusVO vo = new ContentLikeStatusVO();
        vo.setLiked(liked);
        vo.setLikeCount(likeCount != null ? likeCount : 0L);
        return vo;
    }

    private Visitor resolveVisitor(String visitorUuid, String ip, LocalDateTime now) {
        Visitor visitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                .eq(Visitor::getVisitorUuid, visitorUuid)
                .eq(Visitor::getDeleted, 0)
                .last("LIMIT 1"));
        if (visitor == null) {
            visitor = new Visitor();
            visitor.setVisitorUuid(visitorUuid);
            visitor.setFirstVisitTime(now);
            visitor.setLastVisitTime(now);
            visitor.setVisitCount(1);
            visitor.setStatus("ACTIVE");
            visitor.setIp(StringUtils.hasText(ip) ? ip : "UNKNOWN");
            visitorMapper.insert(visitor);
            return visitor;
        }

        visitor.setLastVisitTime(now);
        if (StringUtils.hasText(ip)) {
            visitor.setIp(ip);
        }
        visitorMapper.updateById(visitor);
        return visitor;
    }

    private String normalizeContentType(String raw) {
        String contentType = StringUtils.hasText(raw) ? raw.trim().toUpperCase() : "";
        if (!"ARTICLE".equals(contentType) && !"TALK".equals(contentType)) {
            throw new BusinessException(400, "Invalid contentType: " + raw);
        }
        return contentType;
    }

    private LikeAttempt like(Long visitorId, String contentType, Long contentId, LocalDateTime now) {
        try {
            ContentLikeState row = new ContentLikeState();
            row.setVisitorId(visitorId);
            row.setContentType(contentType);
            row.setContentId(contentId);
            row.setLiked(1);
            row.setLastChangedAt(now);
            contentLikeStateMapper.insert(row);

            incrementContentLikeCount(contentType, contentId);
            recordLikeMetric(visitorId, contentType, contentId, 1, now);
            return new LikeAttempt(true, true);
        } catch (DuplicateKeyException e) {
            int affected = contentLikeStateMapper.likeIfNotLiked(visitorId, contentType, contentId, now);
            if (affected > 0) {
                incrementContentLikeCount(contentType, contentId);
                recordLikeMetric(visitorId, contentType, contentId, 1, now);
                return new LikeAttempt(true, true);
            }
            return new LikeAttempt(false, true);
        }
    }

    private LikeAttempt unlike(Long visitorId, String contentType, Long contentId, LocalDateTime now) {
        int affected = contentLikeStateMapper.unlikeIfLiked(visitorId, contentType, contentId, now);
        if (affected > 0) {
            decrementContentLikeCount(contentType, contentId);
            recordLikeMetric(visitorId, contentType, contentId, -1, now);
            return new LikeAttempt(true, false);
        }
        return new LikeAttempt(false, false);
    }

    private void recordLikeMetric(Long visitorId, String contentType, Long contentId, int delta, LocalDateTime now) {
        try {
            ContentMetricEvent event = new ContentMetricEvent();
            event.setVisitorId(visitorId);
            event.setMetric("LIKE");
            event.setContentType(contentType);
            event.setContentId(contentId);
            event.setDelta(delta);
            event.setOccurredAt(now);
            contentMetricEventMapper.insert(event);
        } catch (Exception e) {
            log.warn("Failed to record like metric event: type={}, id={}", contentType, contentId, e);
        }
    }

    private void incrementContentLikeCount(String contentType, Long contentId) {
        if ("ARTICLE".equals(contentType) && articleMapper != null) {
            articleMapper.incrementLikeCount(contentId);
            return;
        }
        if ("TALK".equals(contentType) && talkMapper != null) {
            talkMapper.incrementLikeCount(contentId);
        }
    }

    private void decrementContentLikeCount(String contentType, Long contentId) {
        if ("ARTICLE".equals(contentType) && articleMapper != null) {
            articleMapper.decrementLikeCount(contentId);
            return;
        }
        if ("TALK".equals(contentType) && talkMapper != null) {
            talkMapper.decrementLikeCount(contentId);
        }
    }

    private Long getContentLikeCount(String contentType, Long contentId) {
        if ("ARTICLE".equals(contentType) && articleMapper != null) {
            Article article = articleMapper.selectById(contentId);
            return article != null && article.getLikeCount() != null ? article.getLikeCount().longValue() : 0L;
        }
        if ("TALK".equals(contentType) && talkMapper != null) {
            Talk talk = talkMapper.selectById(contentId);
            return talk != null && talk.getLikeCount() != null ? talk.getLikeCount().longValue() : 0L;
        }
        return 0L;
    }

    private record LikeAttempt(boolean changed, boolean liked) {
    }
}


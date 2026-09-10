package com.blog.modules.statistics.listener;


import com.blog.modules.comment.event.*;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.comment.model.enums.CommentStatus;
import com.blog.modules.comment.model.enums.CommentVisibilityStatus;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.statistics.track.mapper.ContentMetricEventMapper;
import com.blog.modules.statistics.track.model.entity.ContentMetricEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
@Slf4j
@Component
public class StatisticsUpdateEventListener {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private ContentMetricEventMapper contentMetricEventMapper;

    /**
     * 评论创建事件
     * 注意：评论创建时不增加统计，只有审核通过且可见时才计入统计
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        try {
            Comment comment = event.getComment();
            if (comment == null) {
                return;
            }
            // 只有审核通过且可见的评论才增加统计
            if (!CommentStatus.APPROVED.matches(comment.getStatus())
                    || !CommentVisibilityStatus.VISIBLE.matches(comment.getIsVisible())
                    || comment.getTargetId() == null) {
                return;
            }

            if ("ARTICLE".equalsIgnoreCase(comment.getTargetType())) {
                articleMapper.update(
                        null,
                        new LambdaUpdateWrapper<Article>()
                                .eq(Article::getId, comment.getTargetId())
                                .eq(Article::getDeleted, 0)
                                .setSql("comment_count = COALESCE(comment_count, 0) + 1")
                );
                recordContentMetricEvent("COMMENT", "ARTICLE", comment.getTargetId(), 1);
                return;
            }
            if ("TALK".equalsIgnoreCase(comment.getTargetType())) {
                talkMapper.update(
                        null,
                        new LambdaUpdateWrapper<Talk>()
                                .eq(Talk::getId, comment.getTargetId())
                                .eq(Talk::getDeleted, 0)
                                .setSql("comment_count = COALESCE(comment_count, 0) + 1")
                );
                recordContentMetricEvent("COMMENT", "TALK", comment.getTargetId(), 1);
            }
        } catch (Exception e) {
            log.error("评论创建后异步更新统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentDeleted(CommentDeletedEvent event) {
        try {
            com.blog.modules.comment.model.entity.Comment comment = event.getComment();
            // 只有删除可见的评论时才减少统计
            if (comment.getStatus() != null && comment.getStatus() == 1 &&
                comment.getIsVisible() != null && comment.getIsVisible() == 1) {
                if (comment.getTargetId() != null && "ARTICLE".equalsIgnoreCase(comment.getTargetType())) {
                    articleMapper.update(
                            null,
                            new LambdaUpdateWrapper<Article>()
                                    .eq(Article::getId, comment.getTargetId())
                                    .eq(Article::getDeleted, 0)
                                    .setSql("comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)")
                    );
                    recordContentMetricEvent("COMMENT", "ARTICLE", comment.getTargetId(), -1);
                }
                if (comment.getTargetId() != null && "TALK".equalsIgnoreCase(comment.getTargetType())) {
                    talkMapper.update(
                            null,
                            new LambdaUpdateWrapper<Talk>()
                                    .eq(Talk::getId, comment.getTargetId())
                                    .eq(Talk::getDeleted, 0)
                                    .setSql("comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)")
                    );
                    recordContentMetricEvent("COMMENT", "TALK", comment.getTargetId(), -1);
                }
            }
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    /**
     * 评论审核通过事件
     * 按「前态 → 后态」迁移计算 delta：只有从未计数变为计数才 +1，
     * 避免对已计数评论重复审核时重复累加。
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentApproved(com.blog.modules.comment.event.CommentApprovedEvent event) {
        try {
            com.blog.modules.comment.model.entity.Comment comment = event.getComment();
            boolean countedBefore = event.isPreviouslyCounted();
            boolean countedNow = isCounted(comment);
            if (countedBefore == countedNow) {
                return;
            }
            int delta = countedNow ? 1 : -1;
            applyCommentCountDelta(comment, delta, event.getCommentId());
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    /**
     * 评论更新事件（可见性/审核状态变更）
     * delta 由「前态是否计数 → 后态是否计数」的迁移决定：
     * 计数→不计数 减 1，不计数→计数 加 1，其余不动。
     * 事件侧携带变更前状态（previouslyCounted），仅凭最终状态无法正确推导。
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentUpdated(com.blog.modules.comment.event.CommentUpdatedEvent event) {
        try {
            com.blog.modules.comment.model.entity.Comment comment = event.getComment();
            boolean countedBefore = event.isPreviouslyCounted();
            boolean countedNow = isCounted(comment);
            if (countedBefore == countedNow) {
                return;
            }
            int delta = countedNow ? 1 : -1;
            applyCommentCountDelta(comment, delta, event.getCommentId());
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    private boolean isCounted(com.blog.modules.comment.model.entity.Comment comment) {
        return comment != null
                && CommentStatus.APPROVED.matches(comment.getStatus())
                && CommentVisibilityStatus.VISIBLE.matches(comment.getIsVisible())
                && comment.getTargetId() != null;
    }

    private void applyCommentCountDelta(Comment comment, int delta, Long commentId) {
        if (comment.getTargetId() == null) {
            return;
        }
        String sql = delta > 0
                ? "comment_count = COALESCE(comment_count, 0) + 1"
                : "comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)";
        if ("ARTICLE".equalsIgnoreCase(comment.getTargetType())) {
            articleMapper.update(
                    null,
                    new LambdaUpdateWrapper<Article>()
                            .eq(Article::getId, comment.getTargetId())
                            .eq(Article::getDeleted, 0)
                            .setSql(sql)
            );
            recordContentMetricEvent("COMMENT", "ARTICLE", comment.getTargetId(), delta);
            log.info("文章评论统计已更新，文章ID: {}, 评论ID: {}, delta: {}", comment.getTargetId(), commentId, delta);
        } else if ("TALK".equalsIgnoreCase(comment.getTargetType())) {
            talkMapper.update(
                    null,
                    new LambdaUpdateWrapper<Talk>()
                            .eq(Talk::getId, comment.getTargetId())
                            .eq(Talk::getDeleted, 0)
                            .setSql(sql)
            );
            recordContentMetricEvent("COMMENT", "TALK", comment.getTargetId(), delta);
            log.info("说说评论统计已更新，说说ID: {}, 评论ID: {}, delta: {}", comment.getTargetId(), commentId, delta);
        }
    }

    private void recordContentMetricEvent(String metric, String contentType, Long contentId, int delta) {
        try {
            ContentMetricEvent event = new ContentMetricEvent();
            event.setMetric(metric);
            event.setContentType(contentType);
            event.setContentId(contentId);
            event.setDelta(delta);
            event.setOccurredAt(LocalDateTime.now());
            contentMetricEventMapper.insert(event);
        } catch (Exception e) {
            log.warn("记录内容指标事件失败: metric={}, type={}, id={}", metric, contentType, contentId, e);
        }
    }
}


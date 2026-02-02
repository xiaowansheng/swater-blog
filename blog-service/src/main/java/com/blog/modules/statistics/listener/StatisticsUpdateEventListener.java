package com.blog.modules.statistics.listener;


import com.blog.modules.comment.event.*;
import com.blog.modules.comment.model.entity.Comment;
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
            if (comment.getStatus() == null || comment.getStatus() != 1
                    || comment.getIsVisible() == null || comment.getIsVisible() != 1
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
     * 当评论被审核通过时，如果也是可见的，则增加统计
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentApproved(com.blog.modules.comment.event.CommentApprovedEvent event) {
        try {
            com.blog.modules.comment.model.entity.Comment comment = event.getComment();
            // 只有审核通过且可见的评论才增加统计
            if (comment.getStatus() != null && comment.getStatus() == 1 &&
                comment.getIsVisible() != null && comment.getIsVisible() == 1) {
                if (comment.getTargetId() != null && "ARTICLE".equalsIgnoreCase(comment.getTargetType())) {
                    articleMapper.update(
                            null,
                            new LambdaUpdateWrapper<Article>()
                                    .eq(Article::getId, comment.getTargetId())
                                    .eq(Article::getDeleted, 0)
                                    .setSql("comment_count = COALESCE(comment_count, 0) + 1")
                    );
                    recordContentMetricEvent("COMMENT", "ARTICLE", comment.getTargetId(), 1);
                    log.info("文章评论统计已增加，文章ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                }
                if (comment.getTargetId() != null && "TALK".equalsIgnoreCase(comment.getTargetType())) {
                    talkMapper.update(
                            null,
                            new LambdaUpdateWrapper<Talk>()
                                    .eq(Talk::getId, comment.getTargetId())
                                    .eq(Talk::getDeleted, 0)
                                    .setSql("comment_count = COALESCE(comment_count, 0) + 1")
                    );
                    recordContentMetricEvent("COMMENT", "TALK", comment.getTargetId(), 1);
                    log.info("说说评论统计已增加，说说ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                }
            }
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    /**
     *评论更新事件
     * 当评论可见性变更时，更新统计
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentUpdated(com.blog.modules.comment.event.CommentUpdatedEvent event) {
        try {
            com.blog.modules.comment.model.entity.Comment comment = event.getComment();
            if (comment.getTargetId() == null) {
                return;
            }

            Integer status = comment.getStatus();
            Integer isVisible = comment.getIsVisible();
            Integer delta = null;
            if (isVisible != null && isVisible == 0 && status != null && status == 1) {
                delta = -1;
            } else if (isVisible != null && isVisible == 1 && status != null && status == 1) {
                delta = 1;
            } else if (status != null && status == 0) {
                delta = -1;
            }
            if (delta == null) {
                return;
            }

            if ("ARTICLE".equalsIgnoreCase(comment.getTargetType())) {
                if (delta > 0) {
                    articleMapper.update(
                            null,
                            new LambdaUpdateWrapper<Article>()
                                    .eq(Article::getId, comment.getTargetId())
                                    .eq(Article::getDeleted, 0)
                                    .setSql("comment_count = COALESCE(comment_count, 0) + 1")
                    );
                } else {
                    articleMapper.update(
                            null,
                            new LambdaUpdateWrapper<Article>()
                                    .eq(Article::getId, comment.getTargetId())
                                    .eq(Article::getDeleted, 0)
                                    .setSql("comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)")
                    );
                }
                recordContentMetricEvent("COMMENT", "ARTICLE", comment.getTargetId(), delta);
                log.info("文章评论统计已更新，文章ID: {}, 评论ID: {}, delta: {}", comment.getTargetId(), event.getCommentId(), delta);
                return;
            }

            if ("TALK".equalsIgnoreCase(comment.getTargetType())) {
                if (delta > 0) {
                    talkMapper.update(
                            null,
                            new LambdaUpdateWrapper<Talk>()
                                    .eq(Talk::getId, comment.getTargetId())
                                    .eq(Talk::getDeleted, 0)
                                    .setSql("comment_count = COALESCE(comment_count, 0) + 1")
                    );
                } else {
                    talkMapper.update(
                            null,
                            new LambdaUpdateWrapper<Talk>()
                                    .eq(Talk::getId, comment.getTargetId())
                                    .eq(Talk::getDeleted, 0)
                                    .setSql("comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)")
                    );
                }
                recordContentMetricEvent("COMMENT", "TALK", comment.getTargetId(), delta);
                log.info("说说评论统计已更新，说说ID: {}, 评论ID: {}, delta: {}", comment.getTargetId(), event.getCommentId(), delta);
            }
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
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


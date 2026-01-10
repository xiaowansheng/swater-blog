package com.blog.modules.statistics.listener;


import com.blog.modules.comment.event.*;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.talk.model.entity.Talk;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
@Slf4j
@Component
public class StatisticsUpdateEventListener {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    /**
     * 评论创建事件
     * 注意：评论创建时不增加统计，只有审核通过且可见时才计入统计
     */
    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        // 评论创建时不更新统计，等待审核通过后再更新
        log.debug("评论创建事件，评论ID: {}，等待审核通过后更新统计", event.getCommentId());
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
                    Article article = articleMapper.selectById(comment.getTargetId());
                    if (article != null && article.getDeleted() == 0) {
                        article.setCommentCount(Math.max(0, (article.getCommentCount() != null ? article.getCommentCount() : 0) - 1));
                        articleMapper.updateById(article);
                    }
                }
                if (comment.getTargetId() != null && "TALK".equalsIgnoreCase(comment.getTargetType())) {
                    Talk talk = talkMapper.selectById(comment.getTargetId());
                    if (talk != null && talk.getDeleted() == 0) {
                        talk.setCommentCount(Math.max(0, (talk.getCommentCount() != null ? talk.getCommentCount() : 0) - 1));
                        talkMapper.updateById(talk);
                    }
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
                    Article article = articleMapper.selectById(comment.getTargetId());
                    if (article != null && article.getDeleted() == 0) {
                        article.setCommentCount((article.getCommentCount() != null ? article.getCommentCount() : 0) + 1);
                        articleMapper.updateById(article);
                        log.info("文章评论统计已增加，文章ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
                }
                if (comment.getTargetId() != null && "TALK".equalsIgnoreCase(comment.getTargetType())) {
                    Talk talk = talkMapper.selectById(comment.getTargetId());
                    if (talk != null && talk.getDeleted() == 0) {
                        talk.setCommentCount((talk.getCommentCount() != null ? talk.getCommentCount() : 0) + 1);
                        talkMapper.updateById(talk);
                        log.info("说说评论统计已增加，说说ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
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
            if (comment.getTargetId() != null && "ARTICLE".equalsIgnoreCase(comment.getTargetType())) {
                Article article = articleMapper.selectById(comment.getTargetId());
                if (article != null && article.getDeleted() == 0) {
                    // 如果评论被设为不可见，减少统计
                    if (comment.getIsVisible() != null && comment.getIsVisible() == 0 &&
                        comment.getStatus() != null && comment.getStatus() == 1) {
                        article.setCommentCount(Math.max(0, (article.getCommentCount() != null ? article.getCommentCount() : 0) - 1));
                        articleMapper.updateById(article);
                        log.info("文章评论统计已减少（隐藏），文章ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
                    // 如果评论被设为可见且已审核通过，增加统计
                    else if (comment.getIsVisible() != null && comment.getIsVisible() == 1 &&
                             comment.getStatus() != null && comment.getStatus() == 1) {
                        article.setCommentCount((article.getCommentCount() != null ? article.getCommentCount() : 0) + 1);
                        articleMapper.updateById(article);
                        log.info("文章评论统计已增加（可见），文章ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
                    // 如果评论被拒绝，减少统计
                    else if (comment.getStatus() != null && comment.getStatus() == 0) {
                        article.setCommentCount(Math.max(0, (article.getCommentCount() != null ? article.getCommentCount() : 0) - 1));
                        articleMapper.updateById(article);
                        log.info("文章评论统计已减少（拒绝），文章ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
                }
            }
            if (comment.getTargetId() != null && "TALK".equalsIgnoreCase(comment.getTargetType())) {
                Talk talk = talkMapper.selectById(comment.getTargetId());
                if (talk != null && talk.getDeleted() == 0) {
                    // 如果评论被设为不可见，减少统计
                    if (comment.getIsVisible() != null && comment.getIsVisible() == 0 &&
                        comment.getStatus() != null && comment.getStatus() == 1) {
                        talk.setCommentCount(Math.max(0, (talk.getCommentCount() != null ? talk.getCommentCount() : 0) - 1));
                        talkMapper.updateById(talk);
                        log.info("说说评论统计已减少（隐藏），说说ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
                    // 如果评论被设为可见且已审核通过，增加统计
                    else if (comment.getIsVisible() != null && comment.getIsVisible() == 1 &&
                             comment.getStatus() != null && comment.getStatus() == 1) {
                        talk.setCommentCount((talk.getCommentCount() != null ? talk.getCommentCount() : 0) + 1);
                        talkMapper.updateById(talk);
                        log.info("说说评论统计已增加（可见），说说ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
                    // 如果评论被拒绝，减少统计
                    else if (comment.getStatus() != null && comment.getStatus() == 0) {
                        talk.setCommentCount(Math.max(0, (talk.getCommentCount() != null ? talk.getCommentCount() : 0) - 1));
                        talkMapper.updateById(talk);
                        log.info("说说评论统计已减少（拒绝），说说ID: {}, 评论ID: {}", comment.getTargetId(), event.getCommentId());
                    }
                }
            }
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }
}


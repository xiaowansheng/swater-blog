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

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        try {
            com.blog.modules.comment.model.entity.Comment comment = event.getComment();
            if (comment.getTargetId() != null && "ARTICLE".equalsIgnoreCase(comment.getTargetType())) {
                Article article = articleMapper.selectById(comment.getTargetId());
                if (article != null && article.getDeleted() == 0) {
                    article.setCommentCount((article.getCommentCount() != null ? article.getCommentCount() : 0) + 1);
                    articleMapper.updateById(article);
                }
            }
            if (comment.getTargetId() != null && "TALK".equalsIgnoreCase(comment.getTargetType())) {
                Talk talk = talkMapper.selectById(comment.getTargetId());
                if (talk != null && talk.getDeleted() == 0) {
                    talk.setCommentCount((talk.getCommentCount() != null ? talk.getCommentCount() : 0) + 1);
                    talkMapper.updateById(talk);
                }
            }
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentDeleted(CommentDeletedEvent event) {
        try {
            com.blog.modules.comment.model.entity.Comment comment = event.getComment();
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
        } catch (Exception e) {
            log.error("更新评论统计失败，评论ID: {}", event.getCommentId(), e);
        }
    }
}


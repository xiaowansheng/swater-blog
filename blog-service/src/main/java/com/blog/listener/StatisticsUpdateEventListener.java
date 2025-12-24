package com.blog.listener;

import com.blog.event.comment.*;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.TalkMapper;
import com.blog.model.entity.Article;
import com.blog.model.entity.Talk;
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
            if (event.getComment().getPostId() != null) {
                Article article = articleMapper.selectById(event.getComment().getPostId());
                if (article != null && article.getDeleted() == 0) {
                    article.setCommentCount((article.getCommentCount() != null ? article.getCommentCount() : 0) + 1);
                    articleMapper.updateById(article);
                }
            }
            if (event.getComment().getMomentId() != null) {
                Talk talk = talkMapper.selectById(event.getComment().getMomentId());
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
            if (event.getComment().getPostId() != null) {
                Article article = articleMapper.selectById(event.getComment().getPostId());
                if (article != null && article.getDeleted() == 0) {
                    article.setCommentCount(Math.max(0, (article.getCommentCount() != null ? article.getCommentCount() : 0) - 1));
                    articleMapper.updateById(article);
                }
            }
            if (event.getComment().getMomentId() != null) {
                Talk talk = talkMapper.selectById(event.getComment().getMomentId());
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


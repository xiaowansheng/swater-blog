package com.blog.modules.comment.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.comment.event.CommentApprovedEvent;
import com.blog.modules.comment.event.CommentDeletedEvent;
import com.blog.modules.comment.event.CommentUpdatedEvent;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.talk.model.entity.Talk;
import com.blog.modules.comment.service.CommentCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
@Service
public class CommentCommandServiceImpl implements CommentCommandService {
    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public void approve(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        comment.setStatus(1);
        commentMapper.updateById(comment);
        
        Comment approvedComment = commentMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentApprovedEvent(this, id, approvedComment)));
    }

    @Override
    @Transactional
    public void reject(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        comment.setStatus(0);
        commentMapper.updateById(comment);
        
        Comment updatedComment = commentMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentUpdatedEvent(this, id, updatedComment)));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        
        commentMapper.deleteById(id);
        
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentDeletedEvent(this, id, comment)));
    }

    @Override
    @Transactional
    public void setVisible(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        comment.setIsVisible(0);
        commentMapper.updateById(comment);
        
        Comment updatedComment = commentMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentUpdatedEvent(this, id, updatedComment)));
    }

    @Override
    @Transactional
    public void setHidden(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        comment.setIsVisible(1);
        commentMapper.updateById(comment);
        
        Comment updatedComment = commentMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentUpdatedEvent(this, id, updatedComment)));
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


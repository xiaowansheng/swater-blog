package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.event.comment.CommentApprovedEvent;
import com.blog.event.comment.CommentDeletedEvent;
import com.blog.event.comment.CommentUpdatedEvent;
import com.blog.exception.BusinessException;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CommentMapper;
import com.blog.mapper.TalkMapper;
import com.blog.model.entity.Article;
import com.blog.model.entity.Comment;
import com.blog.model.entity.Talk;
import com.blog.service.CommentAdminCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class CommentAdminCommandServiceImpl implements CommentAdminCommandService {
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
        if (comment == null || comment.getDeleted() == 1) {
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
        if (comment == null || comment.getDeleted() == 1) {
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
        if (comment == null || comment.getDeleted() == 1) {
            throw new BusinessException("评论不存在");
        }
        
        commentMapper.deleteById(id);
        
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentDeletedEvent(this, id, comment)));
    }

    @Override
    @Transactional
    public void setVisible(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getDeleted() == 1) {
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
        if (comment == null || comment.getDeleted() == 1) {
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


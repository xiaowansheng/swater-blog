package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.CommentMapper;
import com.blog.mapper.TalkMapper;
import com.blog.model.entity.Article;
import com.blog.model.entity.Comment;
import com.blog.model.entity.Talk;
import com.blog.service.CommentAdminCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentAdminCommandServiceImpl implements CommentAdminCommandService {
    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private TalkMapper talkMapper;

    @Override
    @Transactional
    public void approve(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getDeleted() == 1) {
            throw new BusinessException("评论不存在");
        }
        comment.setStatus(1);
        commentMapper.updateById(comment);
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
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null || comment.getDeleted() == 1) {
            throw new BusinessException("评论不存在");
        }
        
        commentMapper.deleteById(id);
        
        if (comment.getPostId() != null) {
            Article article = articleMapper.selectById(comment.getPostId());
            if (article != null) {
                article.setCommentCount(Math.max(0, (article.getCommentCount() != null ? article.getCommentCount() : 0) - 1));
                articleMapper.updateById(article);
            }
        }
        
        if (comment.getMomentId() != null) {
            Talk talk = talkMapper.selectById(comment.getMomentId());
            if (talk != null) {
                talk.setCommentCount(Math.max(0, (talk.getCommentCount() != null ? talk.getCommentCount() : 0) - 1));
                talkMapper.updateById(talk);
            }
        }
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
    }
}


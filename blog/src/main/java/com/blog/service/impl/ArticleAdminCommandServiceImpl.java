package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.ArticleMapper;
import com.blog.mapper.ArticleTagMapper;
import com.blog.model.dto.ArticleDTO;
import com.blog.model.entity.Article;
import com.blog.model.entity.ArticleTag;
import com.blog.service.ArticleAdminCommandService;
import com.blog.util.BeanUtil;
import com.blog.util.KeyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleAdminCommandServiceImpl implements ArticleAdminCommandService {
    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Override
    @Transactional
    public Long create(ArticleDTO dto) {
        Article article = BeanUtil.copyProperties(dto, Article.class);
        article.setArticleKey(KeyUtil.generateKey("article"));
        article.setViewCount(0);
        article.setLikeCount(0);
        article.setCommentCount(0);
        if (dto.getStatus() == null) {
            article.setStatus(0);
        }
        if (dto.getIsTop() == null) {
            article.setIsTop(0);
        }
        if (dto.getType() == null) {
            article.setType("1");
        }
        if (article.getStatus() == 1) {
            article.setPublishedAt(LocalDateTime.now());
        }
        
        articleMapper.insert(article);
        
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            saveArticleTags(article.getId(), dto.getTagIds());
        }
        
        return article.getId();
    }

    @Override
    @Transactional
    public void update(Long id, ArticleDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getDeleted() == 1) {
            throw new BusinessException("文章不存在");
        }
        
        article.setTitle(dto.getTitle());
        article.setSlug(dto.getSlug());
        article.setContent(dto.getContent());
        article.setExcerpt(dto.getExcerpt());
        article.setCover(dto.getCover());
        article.setCategoryId(dto.getCategoryId());
        article.setType(dto.getType());
        article.setOriginalAuthor(dto.getOriginalAuthor());
        article.setOriginalTitle(dto.getOriginalTitle());
        article.setOriginalUrl(dto.getOriginalUrl());
        article.setNote(dto.getNote());
        article.setStatus(dto.getStatus());
        article.setIsTop(dto.getIsTop());
        
        if (dto.getStatus() != null && dto.getStatus() == 1 && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        
        articleMapper.updateById(article);
        
        articleTagMapper.deleteByArticleId(id);
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            saveArticleTags(id, dto.getTagIds());
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getDeleted() == 1) {
            throw new BusinessException("文章不存在");
        }
        articleMapper.deleteById(id);
        articleTagMapper.deleteByArticleId(id);
    }

    @Override
    @Transactional
    public void deleteBatch(List<Long> ids) {
        for (Long id : ids) {
            delete(id);
        }
    }

    @Override
    @Transactional
    public void publish(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getDeleted() == 1) {
            throw new BusinessException("文章不存在");
        }
        article.setStatus(1);
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        articleMapper.updateById(article);
    }

    @Override
    @Transactional
    public void unpublish(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getDeleted() == 1) {
            throw new BusinessException("文章不存在");
        }
        article.setStatus(0);
        articleMapper.updateById(article);
    }

    private void saveArticleTags(Long articleId, List<Long> tagIds) {
        List<ArticleTag> articleTags = tagIds.stream()
                .map(tagId -> {
                    ArticleTag articleTag = new ArticleTag();
                    articleTag.setArticleId(articleId);
                    articleTag.setTagId(tagId);
                    return articleTag;
                })
                .collect(Collectors.toList());
        for (ArticleTag articleTag : articleTags) {
            articleTagMapper.insert(articleTag);
        }
    }
}


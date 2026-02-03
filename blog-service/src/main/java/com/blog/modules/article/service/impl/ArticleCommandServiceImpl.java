package com.blog.modules.article.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.event.*;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.infrastructure.metrics.BlogMetrics;
import com.blog.modules.article.model.dto.ArticleDTO;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleTag;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.service.ArticleCommandService;
import com.blog.modules.category.service.CategoryService;
import com.blog.modules.file.service.FileService;
import com.blog.modules.tag.service.TagService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.KeyUtil;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class ArticleCommandServiceImpl implements ArticleCommandService {
    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private TagService tagService;

    @Autowired
    private FileService fileService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private BlogMetrics blogMetrics;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(ArticleDTO dto) {
        Timer.Sample sample = blogMetrics.startTimer();
        
        try {
            // 处理自定义分类
            if (dto.getCategoryId() == null && dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
                dto.setCategoryId(categoryService.findOrCreateByName(dto.getCategoryName()));
            }

            Article article = BeanUtil.copyProperties(dto, Article.class);
            article.setArticleKey(KeyUtil.generateKey("article"));
            article.setViewCount(0);
            article.setLikeCount(0);
            article.setCommentCount(0);
            if (dto.getStatus() == null) {
                article.setStatus(ArticleStatus.DRAFT.getCode());
            }
            if (dto.getIsTop() == null) {
                article.setIsTop(0);
            }
            if (dto.getType() == null) {
                article.setType("1");
            }
            if (article.getStatus().equals(ArticleStatus.PUBLISHED.getCode())) {
                article.setPublishedAt(LocalDateTime.now());
            }
            
            articleMapper.insert(article);
            
            // 处理标签
            java.util.Set<Long> allTagIds = new java.util.HashSet<>();
            if (dto.getTagIds() != null) {
                allTagIds.addAll(dto.getTagIds());
            }
            if (dto.getTagNames() != null) {
                for (String tagName : dto.getTagNames()) {
                    Long tagId = tagService.findOrCreateByName(tagName);
                    if (tagId != null) {
                        allTagIds.add(tagId);
                    }
                }
            }

            if (!allTagIds.isEmpty()) {
                saveArticleTags(article.getId(), new java.util.ArrayList<>(allTagIds));
            }
            
            publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleCreatedEvent(this, article.getId(), article)));
            
            // 记录监控指标
            blogMetrics.incrementArticleCreated(
                dto.getCategoryId() != null ? String.valueOf(dto.getCategoryId()) : "unknown",
                dto.getType() != null ? dto.getType() : "original"
            );
            
            return article.getId();
            
        } finally {
            sample.stop(Timer.builder("blog.article.create.duration")
                .description("文章创建耗时")
                .register(io.micrometer.core.instrument.Metrics.globalRegistry));
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article", "article:slug", "article:list", "article:hot", "article:latest"}, allEntries = true)
    public void update(Long id, ArticleDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }
        
        // 处理自定义分类
        if (dto.getCategoryId() == null && dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
            dto.setCategoryId(categoryService.findOrCreateByName(dto.getCategoryName()));
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
        
        if (dto.getStatus() != null && dto.getStatus().equals(ArticleStatus.PUBLISHED.getCode()) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        
        articleMapper.updateById(article);
        
        articleTagMapper.deleteByArticleId(id);
        
        // 处理标签
        java.util.Set<Long> allTagIds = new java.util.HashSet<>();
        if (dto.getTagIds() != null) {
            allTagIds.addAll(dto.getTagIds());
        }
        if (dto.getTagNames() != null) {
            for (String tagName : dto.getTagNames()) {
                Long tagId = tagService.findOrCreateByName(tagName);
                if (tagId != null) {
                    allTagIds.add(tagId);
                }
            }
        }

        if (!allTagIds.isEmpty()) {
            saveArticleTags(id, new java.util.ArrayList<>(allTagIds));
        }
        
        Article updatedArticle = articleMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleUpdatedEvent(this, id, updatedArticle)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article", "article:slug", "article:list", "article:hot", "article:latest"}, allEntries = true)
    public void delete(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }

        // 清理文件引用关系
        fileService.removeReferences("ARTICLE", id);

        articleMapper.deleteById(id);
        articleTagMapper.deleteByArticleId(id);

        publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleDeletedEvent(this, id)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article", "article:slug", "article:list", "article:hot", "article:latest"}, allEntries = true)
    public void deleteBatch(List<Long> ids) {
        for (Long id : ids) {
            delete(id);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article", "article:slug", "article:list", "article:hot", "article:latest"}, allEntries = true)
    public void publish(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }
        article.setStatus(ArticleStatus.PUBLISHED.getCode());
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        articleMapper.updateById(article);
        
        Article publishedArticle = articleMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticlePublishedEvent(this, id, publishedArticle)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article", "article:slug", "article:list", "article:hot", "article:latest"}, allEntries = true)
    public void unpublish(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }
        // 下架时状态变为私密
        article.setStatus(ArticleStatus.PRIVATE.getCode());
        articleMapper.updateById(article);
        
        Article unpublishedArticle = articleMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleUnpublishedEvent(this, id, unpublishedArticle)));
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


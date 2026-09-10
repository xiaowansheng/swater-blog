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
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.KeyUtil;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.blog.modules.article.model.dto.ArticleMetaDTO;

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
            } else if (article.getStatus().equals(ArticleStatus.SCHEDULED.getCode())) {
                validateScheduledPublishAt(dto.getScheduledPublishAt());
                article.setPublishedAt(dto.getScheduledPublishAt());
            }
            // 密码哈希存储：明文不落库（已在 PasswordUtil 内部对空值校验）
            if (StringUtils.hasText(dto.getPassword())) {
                article.setPassword(com.blog.shared.util.PasswordUtil.encode(dto.getPassword()));
            }
            
            articleMapper.insert(article);
            blogMetrics.updateTotalArticles(articleMapper.selectCount(
                    new LambdaQueryWrapper<Article>().eq(Article::getDeleted, 0)));
            
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
            
            EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleCreatedEvent(this, article.getId(), article)));
            
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
    @CacheEvict(value = {"article:list", "article:hot", "article:latest", "article:related"}, allEntries = true)
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

        // 密码处理：admin 端编辑不回填密码，空值表示保持原密码不变，非空则重新哈希。
        // 仅当显式传入非空明文时才覆盖；传入空串视为清空加密（与 create 行为对齐：不加密）。
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            article.setPassword(com.blog.shared.util.PasswordUtil.encode(dto.getPassword()));
        } else if (dto.getPassword() != null && dto.getPassword().isEmpty()) {
            article.setPassword(null);
        }
        
        if (dto.getStatus() != null && dto.getStatus().equals(ArticleStatus.PUBLISHED.getCode()) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        } else if (dto.getStatus() != null && dto.getStatus().equals(ArticleStatus.SCHEDULED.getCode())) {
            validateScheduledPublishAt(dto.getScheduledPublishAt());
            article.setPublishedAt(dto.getScheduledPublishAt());
        }
        
        articleMapper.updateById(article);
        blogMetrics.incrementArticleUpdated(
                article.getCategoryId() != null ? String.valueOf(article.getCategoryId()) : "unknown",
                article.getType());
        // update 不改变 deleted 计数，无需重算 totalArticles（曾为冗余全表 COUNT）

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
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleUpdatedEvent(this, id, updatedArticle)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article:list", "article:hot", "article:latest", "article:related"}, allEntries = true)
    public void delete(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }

        // 清理文件引用关系
        fileService.removeReferences("ARTICLE", id);

        articleMapper.deleteById(id);
        articleTagMapper.deleteByArticleId(id);
        blogMetrics.incrementArticleDeleted();
        blogMetrics.updateTotalArticles(articleMapper.selectCount(
                new LambdaQueryWrapper<Article>().eq(Article::getDeleted, 0)));

        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleDeletedEvent(this, id)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article:list", "article:hot", "article:latest", "article:related"}, allEntries = true)
    public void deleteBatch(List<Long> ids) {
        for (Long id : ids) {
            delete(id);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article:list", "article:hot", "article:latest", "article:related"}, allEntries = true)
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
        blogMetrics.incrementArticleUpdated(
                article.getCategoryId() != null ? String.valueOf(article.getCategoryId()) : "unknown",
                article.getType());

        Article publishedArticle = articleMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticlePublishedEvent(this, id, publishedArticle)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article:list", "article:hot", "article:latest", "article:related"}, allEntries = true)
    public void unpublish(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }
        // 下架时状态变为私密
        article.setStatus(ArticleStatus.PRIVATE.getCode());
        articleMapper.updateById(article);
        blogMetrics.incrementArticleUpdated(
                article.getCategoryId() != null ? String.valueOf(article.getCategoryId()) : "unknown",
                article.getType());

        Article unpublishedArticle = articleMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleUnpublishedEvent(this, id, unpublishedArticle)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(value = {"article:list", "article:hot", "article:latest", "article:related"}, allEntries = true)
    public void updateMeta(Long id, ArticleMetaDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("文章不存在");
        }

        // 处理自定义分类
        if (dto.getCategoryId() == null && dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
            dto.setCategoryId(categoryService.findOrCreateByName(dto.getCategoryName()));
        }

        if (dto.getTitle() != null) article.setTitle(dto.getTitle());
        if (dto.getSlug() != null) article.setSlug(dto.getSlug());
        if (dto.getExcerpt() != null) article.setExcerpt(dto.getExcerpt());
        if (dto.getCover() != null) article.setCover(dto.getCover());
        if (dto.getCategoryId() != null) article.setCategoryId(dto.getCategoryId());
        if (dto.getType() != null) article.setType(dto.getType());
        if (dto.getOriginalAuthor() != null) article.setOriginalAuthor(dto.getOriginalAuthor());
        if (dto.getOriginalTitle() != null) article.setOriginalTitle(dto.getOriginalTitle());
        if (dto.getOriginalUrl() != null) article.setOriginalUrl(dto.getOriginalUrl());
        if (dto.getNote() != null) article.setNote(dto.getNote());
        if (dto.getStatus() != null) article.setStatus(dto.getStatus());
        if (dto.getIsTop() != null) article.setIsTop(dto.getIsTop());
        if (dto.getArticleKey() != null) article.setArticleKey(dto.getArticleKey());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            article.setPassword(com.blog.shared.util.PasswordUtil.encode(dto.getPassword()));
        } else if (dto.getPassword() != null && dto.getPassword().isEmpty()) {
            article.setPassword(null);
        }

        if (dto.getStatus() != null && dto.getStatus().equals(ArticleStatus.PUBLISHED.getCode()) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }

        articleMapper.updateById(article);
        blogMetrics.incrementArticleUpdated(
                article.getCategoryId() != null ? String.valueOf(article.getCategoryId()) : "unknown",
                article.getType());

        // 处理标签
        if (dto.getTagIds() != null || dto.getTagNames() != null) {
            // updateMeta 是覆盖语义：先清空旧关联，再写入新标签，避免重复键冲突
            articleTagMapper.deleteByArticleId(id);
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
            saveArticleTags(article.getId(), new java.util.ArrayList<>(allTagIds));
        }

        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleUpdatedEvent(this, article.getId(), article)));
    }

    /**
     * 校验定时发布时间：状态为 SCHEDULED 时，scheduledPublishAt 必须非空且在当前时刻之后。
     * 否则 ScheduledPublishTask（每 60s 扫描 publishedAt <= now）会立即发布，与"定时"语义相悖；
     * 或当 scheduledPublishAt 为 null 时文章会处于"永不发布"的死状态。
     */
    private static void validateScheduledPublishAt(LocalDateTime scheduledPublishAt) {
        if (scheduledPublishAt == null) {
            throw new BusinessException("定时发布文章必须指定发布时间");
        }
        if (!scheduledPublishAt.isAfter(LocalDateTime.now())) {
            throw new BusinessException("定时发布时间必须晚于当前时间");
        }
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


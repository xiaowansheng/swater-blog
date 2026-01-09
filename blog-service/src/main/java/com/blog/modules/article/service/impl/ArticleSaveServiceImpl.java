package com.blog.modules.article.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.event.ArticleCreatedEvent;
import com.blog.modules.article.event.ArticleUpdatedEvent;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.article.model.dto.ArticleSaveDTO;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleTag;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.model.vo.ArticleSaveResultVO;
import com.blog.modules.article.service.ArticleSaveService;
import com.blog.modules.category.service.CategoryService;
import com.blog.modules.tag.service.TagService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.KeyUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
/**
 * 文章保存服务实现
 */
@Slf4j
@Service
public class ArticleSaveServiceImpl implements ArticleSaveService {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private TagService tagService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * 文章保存锁，防止同一文章并发保存
     */
    private final ConcurrentHashMap<Long, ReentrantLock> articleLocks = new ConcurrentHashMap<>();

    @Override
    @Transactional
    @CacheEvict(value = {"article", "article:slug", "article:list", "article:hot", "article:latest"}, allEntries = true)
    public ArticleSaveResultVO save(ArticleSaveDTO dto) {
        boolean isNew = dto.getId() == null;
        
        if (isNew) {
            return createArticle(dto);
        } else {
            return updateArticle(dto);
        }
    }

    /**
     * 创建新文章
     */
    private ArticleSaveResultVO createArticle(ArticleSaveDTO dto) {
        // 处理自定义分类
        if (dto.getCategoryId() == null && dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
            dto.setCategoryId(categoryService.findOrCreateByName(dto.getCategoryName()));
        }

        String articleKey = dto.getArticleKey();
        if (articleKey == null || articleKey.trim().isEmpty()) {
            articleKey = KeyUtil.generateKey("article");
        }

        Article existed = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getArticleKey, articleKey));
        if (existed != null) {
            return ArticleSaveResultVO.builder()
                    .id(existed.getId())
                    .articleKey(existed.getArticleKey())
                    .updateTime(existed.getUpdateTime() != null ? existed.getUpdateTime() : LocalDateTime.now())
                    .version(existed.getVersion())
                    .isNew(false)
                    .autoSave(dto.getAutoSave())
                    .status(existed.getStatus())
                    .hasConflict(false)
                    .build();
        }

        Article article = new Article();
        article.setArticleKey(articleKey);
        article.setTitle(dto.getTitle());
        article.setSlug(dto.getSlug());
        article.setContent(dto.getContent());
        article.setExcerpt(dto.getExcerpt());
        article.setCover(dto.getCover());
        article.setCategoryId(dto.getCategoryId());
        article.setType(dto.getType() != null ? dto.getType() : "1");
        article.setOriginalAuthor(dto.getOriginalAuthor());
        article.setOriginalTitle(dto.getOriginalTitle());
        article.setOriginalUrl(dto.getOriginalUrl());
        article.setNote(dto.getNote());
        article.setStatus(dto.getStatus() != null ? dto.getStatus() : ArticleStatus.DRAFT.getCode());
        article.setIsTop(dto.getIsTop() != null ? dto.getIsTop() : 0);
        article.setViewCount(0);
        article.setLikeCount(0);
        article.setCommentCount(0);
        article.setVersion(1L);
        
        if (article.getStatus().equals(ArticleStatus.PUBLISHED.getCode())) {
            article.setPublishedAt(LocalDateTime.now());
        }

        articleMapper.insert(article);

        // 处理标签
        saveArticleTags(article.getId(), dto.getTagIds(), dto.getTagNames());

        // 发布事件
        Article savedArticle = articleMapper.selectById(article.getId());
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleCreatedEvent(this, article.getId(), savedArticle)));

        log.info("文章创建成功: id={}, title={}, autoSave={}", article.getId(), article.getTitle(), dto.getAutoSave());

        return ArticleSaveResultVO.builder()
                .id(article.getId())
                .articleKey(article.getArticleKey())
                .updateTime(article.getUpdateTime() != null ? article.getUpdateTime() : LocalDateTime.now())
                .version(article.getVersion())
                .isNew(true)
                .autoSave(dto.getAutoSave())
                .status(article.getStatus())
                .hasConflict(false)
                .build();
    }

    /**
     * 更新文章
     */
    private ArticleSaveResultVO updateArticle(ArticleSaveDTO dto) {
        Long articleId = dto.getId();
        
        // 获取文章锁，防止并发更新
        ReentrantLock lock = articleLocks.computeIfAbsent(articleId, k -> new ReentrantLock());
        
        lock.lock();
        try {
            Article article = articleMapper.selectById(articleId);
            if (article == null) {
                throw new BusinessException("文章不存在");
            }

            // 检查版本冲突
            if (dto.getClientVersion() != null && !dto.getClientVersion().equals(article.getVersion())) {
                log.warn("文章版本冲突: id={}, clientVersion={}, serverVersion={}", 
                        articleId, dto.getClientVersion(), article.getVersion());
                
                return ArticleSaveResultVO.builder()
                        .id(articleId)
                        .articleKey(article.getArticleKey())
                        .updateTime(article.getUpdateTime())
                        .version(article.getVersion())
                        .isNew(false)
                        .autoSave(dto.getAutoSave())
                        .status(article.getStatus())
                        .hasConflict(true)
                        .conflictMessage("文章已被其他用户修改，请刷新后重试")
                        .serverContent(article.getContent())
                        .serverUpdateTime(article.getUpdateTime())
                        .build();
            }

            // 处理自定义分类
            if (dto.getCategoryId() == null && dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
                dto.setCategoryId(categoryService.findOrCreateByName(dto.getCategoryName()));
            }

            // 更新文章字段
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
            
            // 只有手动保存时才更新状态
            if (Boolean.FALSE.equals(dto.getAutoSave()) && dto.getStatus() != null) {
                article.setStatus(dto.getStatus());
                if (dto.getStatus().equals(ArticleStatus.PUBLISHED.getCode()) && article.getPublishedAt() == null) {
                    article.setPublishedAt(LocalDateTime.now());
                }
            }
            
            if (dto.getIsTop() != null) {
                article.setIsTop(dto.getIsTop());
            }

            articleMapper.updateById(article);

            // 更新标签
            articleTagMapper.deleteByArticleId(articleId);
            saveArticleTags(articleId, dto.getTagIds(), dto.getTagNames());

            // 重新查询获取最新数据
            Article updatedArticle = articleMapper.selectById(articleId);
            
            // 发布事件
            publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleUpdatedEvent(this, articleId, updatedArticle)));

            log.info("文章更新成功: id={}, title={}, autoSave={}, version={}", 
                    articleId, article.getTitle(), dto.getAutoSave(), updatedArticle.getVersion());

            return ArticleSaveResultVO.builder()
                    .id(articleId)
                    .articleKey(updatedArticle.getArticleKey())
                    .updateTime(updatedArticle.getUpdateTime())
                    .version(updatedArticle.getVersion())
                    .isNew(false)
                    .autoSave(dto.getAutoSave())
                    .status(updatedArticle.getStatus())
                    .hasConflict(false)
                    .build();
                    
        } finally {
            lock.unlock();
            // 清理不再使用的锁
            if (!lock.hasQueuedThreads()) {
                articleLocks.remove(articleId, lock);
            }
        }
    }

    @Override
    public Long getCurrentVersion(Long id) {
        Article article = articleMapper.selectById(id);
        return article != null ? article.getVersion() : null;
    }

    @Override
    public boolean hasConflict(Long id, Long clientVersion) {
        if (id == null || clientVersion == null) {
            return false;
        }
        Long serverVersion = getCurrentVersion(id);
        return serverVersion != null && !serverVersion.equals(clientVersion);
    }

    /**
     * 保存文章标签
     */
    private void saveArticleTags(Long articleId, List<Long> tagIds, List<String> tagNames) {
        Set<Long> allTagIds = new HashSet<>();
        
        if (tagIds != null) {
            allTagIds.addAll(tagIds);
        }
        
        if (tagNames != null) {
            for (String tagName : tagNames) {
                Long tagId = tagService.findOrCreateByName(tagName);
                if (tagId != null) {
                    allTagIds.add(tagId);
                }
            }
        }

        if (!allTagIds.isEmpty()) {
            List<ArticleTag> articleTags = allTagIds.stream()
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

    /**
     * 事务提交后发布事件
     */
    private void publishEventAfterCommit(Runnable runnable) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
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

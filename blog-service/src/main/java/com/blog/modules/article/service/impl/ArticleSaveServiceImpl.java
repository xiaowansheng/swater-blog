package com.blog.modules.article.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.event.ArticleCreatedEvent;
import com.blog.modules.article.event.ArticleUpdatedEvent;
import com.blog.modules.file.model.vo.FileVO;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.file.mapper.FileMetaMapper;
import com.blog.modules.article.model.dto.ArticleSaveDTO;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.entity.ArticleTag;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.model.vo.ArticleSaveResultVO;
import com.blog.modules.article.service.ArticleSaveService;
import com.blog.modules.file.model.entity.FileMeta;
import com.blog.modules.category.service.CategoryService;
import com.blog.modules.file.service.FileService;
import com.blog.modules.file.util.ContentImageExtractor;
import com.blog.modules.tag.service.TagService;
import com.blog.bootstrap.context.UserContext;
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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
/**
 * 文章保存服务实现
 */
@Slf4j
@Service
public class ArticleSaveServiceImpl implements ArticleSaveService {
    private static final String ADMIN_ROLE = "admin";
    private static final String REFERENCE_TYPE_ARTICLE = "ARTICLE";

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private FileMetaMapper fileMetaMapper;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private TagService tagService;

    @Autowired
    private FileService fileService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * 文章保存锁，防止同一文章并发保存
     */
    private final ConcurrentHashMap<Long, LockHolder> articleLocks = new ConcurrentHashMap<>();

    @Override
    @Transactional(rollbackFor = Exception.class)
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
        if (UserContext.isLoggedIn()) {
            article.setAuthorId(UserContext.getCurrentUserId());
        }
        article.setViewCount(0);
        article.setLikeCount(0);
        article.setCommentCount(0);
        article.setVersion(1L);
        
        if (article.getStatus().equals(ArticleStatus.PUBLISHED.getCode())) {
            article.setPublishedAt(LocalDateTime.now());
        }

        articleMapper.insert(article);

        // 处理文件引用关系：验证前端提交的引用列表
        if (dto.getReferencedFileIds() != null && !dto.getReferencedFileIds().isEmpty()) {
            List<Long> validFileIds = findValidReferencedFileIds(
                    dto.getReferencedFileIds(),
                    dto.getCover(),
                    dto.getContent()
            );
            // 只为在内容中找到的文件建立引用关系
            if (!validFileIds.isEmpty()) {
                fileService.addReferences(validFileIds, REFERENCE_TYPE_ARTICLE, article.getId());
            }
        }

        // 处理标签
        saveArticleTags(article.getId(), dto.getTagIds(), dto.getTagNames());

        // 发布事件
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new ArticleCreatedEvent(this, article.getId(), article)));

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
        LockHolder lockHolder = acquireArticleLock(articleId);
        ReentrantLock lock = lockHolder.lock;
        
        lock.lock();
        try {
            Article article = articleMapper.selectById(articleId);
            if (article == null) {
                throw new BusinessException("文章不存在");
            }
            validateUpdatePermission(article);

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

            // 处理文件引用关系：验证前端提交的引用列表
            List<Long> validFileIds = findValidReferencedFileIds(
                    dto.getReferencedFileIds(),
                    dto.getCover(),
                    dto.getContent()
            );

            // 获取旧的引用文件列表（从数据库查询）
            List<Long> oldFileIds = fileService.listByReference(REFERENCE_TYPE_ARTICLE, articleId)
                    .stream()
                    .map(FileVO::getId)
                    .collect(Collectors.toList());

            // 更新文件引用关系（删除旧的，添加验证过的新引用）
            fileService.updateReferences(
                oldFileIds.isEmpty() ? null : oldFileIds,
                validFileIds.isEmpty() ? null : validFileIds,
                REFERENCE_TYPE_ARTICLE,
                articleId
            );

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
            releaseArticleLock(articleId, lockHolder);
        }
    }

    private void validateUpdatePermission(Article article) {
        if (!UserContext.isLoggedIn()) {
            throw new BusinessException("用户未登录");
        }
        if (UserContext.hasRole(ADMIN_ROLE)) {
            return;
        }
        Long currentUserId = UserContext.getCurrentUserId();
        if (currentUserId == null) {
            throw new BusinessException("用户未登录");
        }
        if (article.getAuthorId() == null || !currentUserId.equals(article.getAuthorId())) {
            throw new BusinessException("无权修改他人文章");
        }
    }

    private LockHolder acquireArticleLock(Long articleId) {
        return articleLocks.compute(articleId, (k, existing) -> {
            LockHolder holder = existing != null ? existing : new LockHolder();
            holder.refCount.incrementAndGet();
            return holder;
        });
    }

    private void releaseArticleLock(Long articleId, LockHolder lockHolder) {
        int remaining = lockHolder.refCount.decrementAndGet();
        if (remaining == 0) {
            articleLocks.remove(articleId, lockHolder);
        }
    }

    private static final class LockHolder {
        private final ReentrantLock lock = new ReentrantLock();
        private final AtomicInteger refCount = new AtomicInteger(0);
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
                    .toList();
            
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

    /**
     * 从内容中提取文件ID列表
     */
    private List<Long> extractFileIdsFromContent(String content) {
        if (content == null || content.isEmpty()) {
            return new ArrayList<>();
        }

        // 提取内容中的图片URL
        Set<String> imageUrls = ContentImageExtractor.extractImageUrls(content);

        if (imageUrls.isEmpty()) {
            return new ArrayList<>();
        }

        // 将URL转换为文件ID
        List<Long> fileIds = new ArrayList<>();
        for (String url : imageUrls) {
            Long fileId = fileService.getFileIdByUrl(url);
            if (fileId != null) {
                fileIds.add(fileId);
            }
        }

        return fileIds;
    }

    /**
     * 检查文件是否在文章内容中使用
     * @param fileMeta 文件
     * @param cover 封面URL
     * @param content 文章内容
     * @return 是否在使用中
     */
    private boolean isFileInUse(FileMeta fileMeta, String cover, String content) {
        if (fileMeta == null) {
            return false;
        }
        String fileUrl = fileMeta.getUrl();
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        // 检查是否在封面中
        if (cover != null && cover.contains(fileUrl)) {
            return true;
        }

        // 检查是否在内容中
        if (content != null && content.contains(fileUrl)) {
            return true;
        }

        return false;
    }

    private List<Long> findValidReferencedFileIds(List<Long> referencedFileIds, String cover, String content) {
        if (referencedFileIds == null || referencedFileIds.isEmpty()) {
            return List.of();
        }

        List<Long> uniqueIds = referencedFileIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (uniqueIds.isEmpty()) {
            return List.of();
        }

        List<FileMeta> files = fileMetaMapper.selectBatchIds(uniqueIds);
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        List<Long> validIds = new ArrayList<>();
        for (FileMeta fileMeta : files) {
            if (isFileInUse(fileMeta, cover, content)) {
                validIds.add(fileMeta.getId());
            }
        }
        return validIds;
    }
}

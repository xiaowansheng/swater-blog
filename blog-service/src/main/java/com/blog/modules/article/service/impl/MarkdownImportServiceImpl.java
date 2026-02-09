package com.blog.modules.article.service.impl;

import com.blog.modules.article.model.dto.mdimport.MarkdownImportConfig;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportPreview;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportResult;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportPreview.*;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.service.MarkdownImportService;
import com.blog.modules.article.service.ArticleCommandService;
import com.blog.modules.article.util.*;
import com.blog.modules.category.model.entity.Category;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.file.service.FileService;
import com.blog.modules.file.model.dto.FileUploadDTO;
import com.blog.modules.file.model.vo.FileVO;
import com.blog.bootstrap.context.UserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Markdown 导入服务实现
 */
@Slf4j
@Service
public class MarkdownImportServiceImpl implements MarkdownImportService {

    @Autowired
    private ArticleCommandService articleCommandService;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private FileService fileService;

    @Override
    public MarkdownImportPreview previewImport(MultipartFile[] files, String basePath) throws Exception {
        MarkdownImportPreview preview = new MarkdownImportPreview();

        // 分类 MD 文件和资源文件
        List<MultipartFile> mdFiles = new ArrayList<>();
        List<MultipartFile> assetFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();
            if (isMarkdownFile(filename)) {
                mdFiles.add(file);
            } else if (isAssetFile(filename)) {
                assetFiles.add(file);
            }
        }

        preview.setMdFileCount(mdFiles.size());
        preview.setAssetFileCount(assetFiles.size());
        preview.setTotalFileCount(files.length);

        // 解析 MD 文件
        List<ParsedDocument> documents = new ArrayList<>();
        Map<String, CategoryPreview> categoryMap = new LinkedHashMap<>();

        for (MultipartFile mdFile : mdFiles) {
            try {
                MarkdownParser.MarkdownDocument doc = MarkdownParser.parse(mdFile);
                ParsedDocument parsedDoc = new ParsedDocument();
                parsedDoc.setFilename(mdFile.getOriginalFilename());
                parsedDoc.setDocument(doc);
                parsedDoc.setFilePath(basePath + "/" + mdFile.getOriginalFilename());

                // 创建文章预览
                ArticlePreview articlePreview = createArticlePreview(mdFile.getOriginalFilename(), doc, basePath);
                parsedDoc.setPreview(articlePreview);

                // 处理分类
                if (StringUtils.hasText(articlePreview.getCategoryKey())) {
                    CategoryPreview categoryPreview = categoryMap.computeIfAbsent(
                            articlePreview.getCategoryKey(),
                            k -> createCategoryPreview(articlePreview.getCategoryKey(), articlePreview.getCategory())
                    );
                    categoryPreview.setArticleCount(categoryPreview.getArticleCount() + 1);
                }

                documents.add(parsedDoc);
            } catch (Exception e) {
                log.error("Failed to parse MD file: {}", mdFile.getOriginalFilename(), e);
                ParsedDocument parsedDoc = new ParsedDocument();
                parsedDoc.setFilename(mdFile.getOriginalFilename());
                parsedDoc.setError(e.getMessage());
                documents.add(parsedDoc);
            }
        }

        preview.setDocuments(documents);
        preview.setArticles(documents.stream()
                .map(ParsedDocument::getPreview)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));
        preview.setCategories(new ArrayList<>(categoryMap.values()));
        preview.setArticleCount(preview.getArticles().size());
        preview.setCategoryCount(categoryMap.size());

        return preview;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MarkdownImportResult importSingleFile(MultipartFile file, MarkdownImportConfig config) throws Exception {
        long startTime = System.currentTimeMillis();
        MarkdownImportResult result = new MarkdownImportResult();

        // 解析 MD 文件
        MarkdownParser.MarkdownDocument doc = MarkdownParser.parse(file);

        // 处理分类
        Long categoryId = resolveCategory(doc.getFrontmatter(), file.getOriginalFilename(), config, result);

        // 处理内容
        String processedContent = processContent(doc, file.getOriginalFilename(), config);

        // 创建文章
        Article article = createArticleFromDocument(doc, file.getOriginalFilename(), categoryId, processedContent, config);
        Long articleId = articleCommandService.create(convertToArticleDTO(article));

        // 添加到结果
        MarkdownImportResult.ImportedArticle importedArticle = new MarkdownImportResult.ImportedArticle();
        importedArticle.setOriginalFilename(file.getOriginalFilename());
        importedArticle.setArticleId(articleId);
        importedArticle.setTitle(article.getTitle());
        importedArticle.setSlug(article.getSlug());
        importedArticle.setCategoryId(categoryId);
        importedArticle.setStatus(article.getStatus() == 0 ? "草稿" : "已发布");

        result.addSuccessArticle(importedArticle);
        result.setStatus(result.hasErrors() ?
                MarkdownImportResult.ImportStatus.PARTIAL_SUCCESS :
                MarkdownImportResult.ImportStatus.SUCCESS);

        long endTime = System.currentTimeMillis();
        result.setDuration(endTime - startTime);

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MarkdownImportResult importBatch(MultipartFile[] files, MarkdownImportConfig config) throws Exception {
        long startTime = System.currentTimeMillis();
        MarkdownImportResult result = new MarkdownImportResult();

        // 分类文件：MD 文件和资源文件
        List<MultipartFile> mdFiles = new ArrayList<>();
        Map<String, MultipartFile> assetFileMap = new HashMap<>();

        for (MultipartFile file : files) {
            String filename = file.getOriginalFilename();
            if (isMarkdownFile(filename)) {
                mdFiles.add(file);
            } else if (isAssetFile(filename)) {
                // 构建资源文件映射，key 为相对路径（保留文件夹结构）
                // 文件名可能包含路径信息，如 "images/photo.png" 或 "folder/images/photo.png"
                String normalizedPath = normalizeAssetPath(filename);
                assetFileMap.put(normalizedPath, file);
                log.debug("Registered asset file: {} -> {}", filename, normalizedPath);
            }
        }

        log.info("Found {} MD files and {} asset files", mdFiles.size(), assetFileMap.size());

        // 预览导入以构建分类结构
        MarkdownImportPreview preview = previewImport(files, config.getBasePath());

        // 创建分类
        Map<String, Long> categoryKeyToIdMap = createCategories(preview.getCategories(), config, result);

        // 批量导入文章
        for (MultipartFile mdFile : mdFiles) {
            try {
                MarkdownParser.MarkdownDocument doc = MarkdownParser.parse(mdFile);

                // 解析分类
                Long categoryId = null;
                String categoryKey = determineCategoryKey(mdFile.getOriginalFilename(), preview);
                if (StringUtils.hasText(categoryKey)) {
                    categoryId = categoryKeyToIdMap.get(categoryKey);
                }

                // 处理内容（包含资源上传和路径替换）
                String processedContent = processContentWithAssets(doc, mdFile.getOriginalFilename(), config, assetFileMap, result);

                // 创建文章
                Article article = createArticleFromDocument(doc, mdFile.getOriginalFilename(), categoryId, processedContent, config);
                Long articleId = articleCommandService.create(convertToArticleDTO(article));

                // 添加到结果
                MarkdownImportResult.ImportedArticle importedArticle = new MarkdownImportResult.ImportedArticle();
                importedArticle.setOriginalFilename(mdFile.getOriginalFilename());
                importedArticle.setArticleId(articleId);
                importedArticle.setTitle(article.getTitle());
                importedArticle.setSlug(article.getSlug());
                importedArticle.setCategoryId(categoryId);

                if (categoryId != null) {
                    Category category = categoryMapper.selectById(categoryId);
                    if (category != null) {
                        importedArticle.setCategoryName(category.getName());
                    }
                }

                importedArticle.setStatus(article.getStatus() == 0 ? "草稿" : "已发布");

                result.addSuccessArticle(importedArticle);

            } catch (Exception e) {
                log.error("Failed to import MD file: {}", mdFile.getOriginalFilename(), e);
                result.addFailedArticle(mdFile.getOriginalFilename(), e.getMessage());
            }
        }

        // 设置最终状态
        if (result.getFailedCount() == 0) {
            result.setStatus(MarkdownImportResult.ImportStatus.SUCCESS);
        } else if (result.getSuccessCount() > 0) {
            result.setStatus(MarkdownImportResult.ImportStatus.PARTIAL_SUCCESS);
        } else {
            result.setStatus(MarkdownImportResult.ImportStatus.FAILED);
        }

        long endTime = System.currentTimeMillis();
        result.setDuration(endTime - startTime);

        return result;
    }

    /**
     * 判断是否是 Markdown 文件
     */
    private boolean isMarkdownFile(String filename) {
        if (!StringUtils.hasText(filename)) {
            return false;
        }
        String lower = filename.toLowerCase();
        return lower.endsWith(".md") || lower.endsWith(".markdown");
    }

    /**
     * 判断是否是资源文件
     */
    private boolean isAssetFile(String filename) {
        if (!StringUtils.hasText(filename)) {
            return false;
        }
        String lower = filename.toLowerCase();
        return lower.endsWith(".png") ||
               lower.endsWith(".jpg") ||
               lower.endsWith(".jpeg") ||
               lower.endsWith(".gif") ||
               lower.endsWith(".svg") ||
               lower.endsWith(".webp");
    }

    /**
     * 创建文章预览
     */
    private ArticlePreview createArticlePreview(String filename, MarkdownParser.MarkdownDocument doc, String basePath) {
        ArticlePreview preview = new ArticlePreview();
        preview.setOriginalFilename(filename);
        preview.setFilePath(basePath + "/" + filename);

        // 提取标题
        String title = doc.getFrontmatter().getTitle();
        if (!StringUtils.hasText(title)) {
            // 从文件名提取
            title = filename.replaceAll("\\.(md|markdown)$", "");
            title = title.replace("-", " ").replace("_", " ");
        }
        preview.setTitle(title);

        // Slug
        String slug = doc.getFrontmatter().getSlug();
        if (!StringUtils.hasText(slug)) {
            slug = MarkdownParser.generateSlug(title);
        }
        preview.setSlug(slug);

        // 分类
        String category = doc.getFrontmatter().getCategory();
        if (StringUtils.hasText(category)) {
            preview.setCategory(category);
            preview.setCategoryKey(toCategoryKey(category));
        } else {
            // 从文件路径推断分类
            String inferredCategory = inferCategoryFromPath(filename);
            if (StringUtils.hasText(inferredCategory)) {
                preview.setCategory(inferredCategory);
                preview.setCategoryKey(toCategoryKey(inferredCategory));
            }
        }

        // 标签
        preview.setTags(doc.getFrontmatter().getTags());

        // 摘要
        String excerpt = doc.getFrontmatter().getDescription();
        if (!StringUtils.hasText(excerpt)) {
            excerpt = MarkdownParser.generateExcerpt(doc.getContent(), 200);
        }
        preview.setExcerpt(excerpt);

        // 封面
        preview.setCover(doc.getFrontmatter().getCover());

        // Frontmatter
        preview.setHasFrontmatter(doc.getFrontmatter().getTitle() != null);

        // 草稿状态
        Boolean isDraft = doc.getFrontmatter().getDraft();
        preview.setIsDraft(isDraft != null ? isDraft : Boolean.TRUE);

        // 内容长度
        preview.setContentLength(doc.getContent().length());

        // 图片数量
        preview.setImageCount(doc.getImages().size());

        // 资源文件
        preview.setAssets(doc.getImages());
        preview.setAssetCount(doc.getImages().size());

        return preview;
    }

    /**
     * 创建分类预览
     */
    private CategoryPreview createCategoryPreview(String categoryKey, String categoryName) {
        CategoryPreview preview = new CategoryPreview();
        preview.setCategoryKey(categoryKey);
        preview.setName(categoryName);
        preview.setLevel(0);
        preview.setFullPath(categoryName);
        preview.setWillCreate(true);
        return preview;
    }

    /**
     * 从路径推断分类
     */
    private String inferCategoryFromPath(String path) {
        // 简单实现：取父目录作为分类
        int lastSlash = path.lastIndexOf("/");
        if (lastSlash < 0) {
            lastSlash = path.lastIndexOf("\\");
        }

        if (lastSlash > 0) {
            String parentDir = path.substring(0, lastSlash);
            int parentLastSlash = parentDir.lastIndexOf("/");
            if (parentLastSlash < 0) {
                parentLastSlash = parentDir.lastIndexOf("\\");
            }
            if (parentLastSlash >= 0) {
                return parentDir.substring(parentLastSlash + 1);
            }
            return parentDir;
        }

        return null;
    }

    /**
     * 转换为分类 key
     */
    private String toCategoryKey(String name) {
        if (!StringUtils.hasText(name)) {
            return "";
        }
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\u4e00-\\u9fa5\\s-]", "")
                .replaceAll("[\\s_]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    /**
     * 确定 category key
     */
    private String determineCategoryKey(String filename, MarkdownImportPreview preview) {
        for (ParsedDocument doc : preview.getDocuments()) {
            if (filename.equals(doc.getFilename()) && doc.getPreview() != null) {
                return doc.getPreview().getCategoryKey();
            }
        }
        return null;
    }

    /**
     * 解析分类
     */
    private Long resolveCategory(MarkdownParser.Frontmatter frontmatter, String filename,
                                  MarkdownImportConfig config, MarkdownImportResult result) {
        switch (config.getCategoryMode()) {
            case MANUAL:
                return config.getManualCategoryId();

            case FRONTMATTER:
                String category = frontmatter.getCategory();
                if (StringUtils.hasText(category)) {
                    // 查找或创建分类
                    return findOrCreateCategory(category, null, config, result);
                }
                return null;

            case AUTO:
            default:
                // 从文件路径推断
                String inferredCategory = inferCategoryFromPath(filename);
                if (StringUtils.hasText(inferredCategory)) {
                    return findOrCreateCategory(inferredCategory, null, config, result);
                }
                return null;
        }
    }

    /**
     * 查找或创建分类
     */
    private Long findOrCreateCategory(String categoryName, Long parentId,
                                       MarkdownImportConfig config, MarkdownImportResult result) {
        String categoryKey = toCategoryKey(categoryName);

        // 查找现有分类
        List<Category> existingCategories = categoryMapper.selectList(null);
        for (Category category : existingCategories) {
            if (category.getCategoryKey().equals(categoryKey)) {
                return category.getId();
            }
        }

        // 创建新分类
        if (!config.getAutoCreateCategory()) {
            return null;
        }

        Category newCategory = new Category();
        newCategory.setCategoryKey(categoryKey);
        newCategory.setName(categoryName);
        newCategory.setSlug(categoryKey);
        newCategory.setDescription("自动创建的分类");
        newCategory.setParentId(parentId);
        newCategory.setStatus("ACTIVE");

        categoryMapper.insert(newCategory);

        // 添加到结果
        MarkdownImportResult.CreatedCategory createdCategory = new MarkdownImportResult.CreatedCategory();
        createdCategory.setCategoryId(newCategory.getId());
        createdCategory.setCategoryKey(categoryKey);
        createdCategory.setName(categoryName);
        createdCategory.setParentId(parentId);
        createdCategory.setLevel(parentId == null ? 0 : 1);

        result.addCreatedCategory(createdCategory);

        return newCategory.getId();
    }

    /**
     * 批量创建分类
     */
    private Map<String, Long> createCategories(List<CategoryPreview> categoryPreviews,
                                                MarkdownImportConfig config,
                                                MarkdownImportResult result) {
        Map<String, Long> categoryMap = new HashMap<>();

        for (CategoryPreview preview : categoryPreviews) {
            if (!preview.getWillCreate() || preview.getExists()) {
                continue;
            }

            Long categoryId = findOrCreateCategory(preview.getName(), null, config, result);
            if (categoryId != null) {
                categoryMap.put(preview.getCategoryKey(), categoryId);
            }
        }

        return categoryMap;
    }

    /**
     * 处理内容
     */
    private String processContent(MarkdownParser.MarkdownDocument doc, String filename,
                                  MarkdownImportConfig config) {
        String content = doc.getContent();

        // 根据模式处理图片路径
        switch (config.getAssetMode()) {
            case ABSOLUTE_URL:
                if (StringUtils.hasText(config.getCdnDomain())) {
                    content = MarkdownParser.replaceImageUrls(content, config.getBasePath(), config.getCdnDomain());
                }
                break;

            case RELATIVE_PATH:
                // 保留相对路径，无需处理
                break;

            case BASE64:
                // TODO: 实现 Base64 转换
                break;
        }

        return content;
    }

    /**
     * 处理内容（包含资源上传和路径替换）
     */
    private String processContentWithAssets(MarkdownParser.MarkdownDocument doc, String mdFilename,
                                            MarkdownImportConfig config,
                                            Map<String, MultipartFile> assetFileMap,
                                            MarkdownImportResult result) {
        String content = doc.getContent();
        List<String> images = doc.getImages();

        if (images.isEmpty() || assetFileMap.isEmpty()) {
            return processContent(doc, mdFilename, config);
        }

        log.info("Processing {} images in file: {}", images.size(), mdFilename);

        // 获取 MD 文件的目录路径，用于解析相对路径
        String mdFileDir = getDirectoryPath(mdFilename);

        // 遍历所有图片引用
        for (String imagePath : images) {
            // 跳过已经是绝对 URL 的图片
            if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
                continue;
            }

            // 尝试解析图片路径并匹配资源文件
            MultipartFile assetFile = resolveAssetFile(imagePath, mdFileDir, assetFileMap);

            if (assetFile != null) {
                try {
                    // 上传资源文件
                    FileUploadDTO uploadDTO = new FileUploadDTO();
                    uploadDTO.setCategory("article_content");

                    FileVO uploadedFile = fileService.upload(assetFile, uploadDTO);
                    String newUrl = uploadedFile.getUrl();

                    if (StringUtils.hasText(newUrl)) {
                        // 替换内容中的图片路径
                        content = content.replace("(" + imagePath + ")", "(" + newUrl + ")");
                        log.debug("Replaced image path: {} -> {}", imagePath, newUrl);
                        
                        // 记录上传的资源
                        if (result != null) {
                            result.addUploadedAsset(assetFile.getOriginalFilename(), newUrl);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to upload asset file for image: {}, error: {}", imagePath, e.getMessage());
                }
            } else {
                log.debug("No matching asset file found for image: {} (mdDir: {})", imagePath, mdFileDir);
            }
        }

        return content;
    }

    /**
     * 规范化资源文件路径
     * 将文件路径转换为统一格式，便于匹配
     */
    private String normalizeAssetPath(String path) {
        if (path == null) return "";
        // 统一使用正斜杠，去除前导斜杠
        return path.replace("\\", "/").replaceFirst("^[./]+", "").toLowerCase();
    }

    /**
     * 获取文件的目录路径
     */
    private String getDirectoryPath(String filePath) {
        if (filePath == null) return "";
        filePath = filePath.replace("\\", "/");
        int lastSlash = filePath.lastIndexOf('/');
        return lastSlash > 0 ? filePath.substring(0, lastSlash) : "";
    }

    /**
     * 解析并匹配资源文件
     * 尝试多种路径方式来匹配资源文件
     */
    private MultipartFile resolveAssetFile(String imagePath, String mdFileDir,
                                           Map<String, MultipartFile> assetFileMap) {
        // 规范化图片路径
        String normalizedImagePath = normalizeAssetPath(imagePath);

        // 尝试直接匹配
        if (assetFileMap.containsKey(normalizedImagePath)) {
            return assetFileMap.get(normalizedImagePath);
        }

        // 尝试相对于 MD 文件目录的路径
        if (StringUtils.hasText(mdFileDir)) {
            String resolvedPath = normalizeAssetPath(mdFileDir + "/" + imagePath);
            if (assetFileMap.containsKey(resolvedPath)) {
                return assetFileMap.get(resolvedPath);
            }
        }

        // 尝试只匹配文件名
        String fileName = normalizedImagePath;
        int lastSlash = normalizedImagePath.lastIndexOf('/');
        if (lastSlash >= 0) {
            fileName = normalizedImagePath.substring(lastSlash + 1);
        }

        for (Map.Entry<String, MultipartFile> entry : assetFileMap.entrySet()) {
            String assetPath = entry.getKey();
            String assetFileName = assetPath;
            int assetLastSlash = assetPath.lastIndexOf('/');
            if (assetLastSlash >= 0) {
                assetFileName = assetPath.substring(assetLastSlash + 1);
            }

            if (assetFileName.equals(fileName)) {
                return entry.getValue();
            }
        }

        return null;
    }

    /**
     * 从文档创建文章
     */
    private Article createArticleFromDocument(MarkdownParser.MarkdownDocument doc, String filename,
                                              Long categoryId, String content, MarkdownImportConfig config) {
        Article article = new Article();

        // 标题
        String title = doc.getFrontmatter().getTitle();
        if (!StringUtils.hasText(title)) {
            title = filename.replaceAll("\\.(md|markdown)$", "");
            title = title.replace("-", " ").replace("_", " ");
        }
        article.setTitle(title);

        // Slug
        String slug = doc.getFrontmatter().getSlug();
        if (!StringUtils.hasText(slug)) {
            slug = MarkdownParser.generateSlug(title);
        }
        article.setSlug(slug);

        // 内容
        article.setContent(content);

        // 摘要
        String excerpt = doc.getFrontmatter().getDescription();
        if (!StringUtils.hasText(excerpt)) {
            excerpt = MarkdownParser.generateExcerpt(content, 200);
        }
        article.setExcerpt(excerpt);

        // 封面
        article.setCover(doc.getFrontmatter().getCover());

        // 分类
        article.setCategoryId(categoryId);

        // 作者
        Long authorId = config.getAuthorId();
        if (authorId == null) {
            try {
                authorId = UserContext.getCurrentUserId();
            } catch (Exception e) {
                // 如果无法获取当前用户，使用默认值
                authorId = 1L;
            }
        }
        article.setAuthorId(authorId);

        // 类型
        article.setType(config.getArticleType());

        // 状态
        Boolean isDraft = doc.getFrontmatter().getDraft();
        Integer status = (isDraft != null ? isDraft : config.getDefaultStatus() == MarkdownImportConfig.ArticleStatus.DRAFT) ? 0 : 1;
        article.setStatus(status);

        // 发布时间
        if (status == 1) {
            article.setPublishedAt(LocalDateTime.now());
        }

        // createTime 和 updateTime 由 BaseEntity 自动填充

        return article;
    }

    /**
     * 转换为 ArticleDTO
     */
    private com.blog.modules.article.model.dto.ArticleDTO convertToArticleDTO(Article article) {
        com.blog.modules.article.model.dto.ArticleDTO dto = new com.blog.modules.article.model.dto.ArticleDTO();
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setContent(article.getContent());
        dto.setExcerpt(article.getExcerpt());
        dto.setCover(article.getCover());
        dto.setCategoryId(article.getCategoryId());
        dto.setType(article.getType());
        dto.setStatus(article.getStatus());
        return dto;
    }
}

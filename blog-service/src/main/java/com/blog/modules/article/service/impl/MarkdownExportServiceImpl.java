package com.blog.modules.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.mapper.ArticleTagMapper;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportConfig;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportPreview;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportResult;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.service.MarkdownExportService;
import com.blog.modules.category.mapper.CategoryMapper;
import com.blog.modules.category.model.entity.Category;
import com.blog.modules.tag.mapper.TagMapper;
import com.blog.modules.tag.model.entity.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Markdown 导出服务实现
 */
@Slf4j
@Service
public class MarkdownExportServiceImpl implements MarkdownExportService {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Value("${blog.export.temp-dir:${java.io.tmpdir}/blog-exports}")
    private String exportTempDir;

    @Value("${blog.export.expire-hours:24}")
    private int expireHours;

    // 匹配 Markdown 图片语法: ![alt](url)
    private static final Pattern IMAGE_PATTERN = Pattern.compile("!\\[([^\\]]*)\\]\\(([^)]+)\\)");

    // 匹配 HTML img 标签
    private static final Pattern IMG_TAG_PATTERN = Pattern.compile("<img[^>]+src=[\"']([^\"']+)[\"'][^>]*>");

    @Override
    public MarkdownExportPreview preview(MarkdownExportConfig config) {
        MarkdownExportPreview preview = new MarkdownExportPreview();
        
        // 查询文章
        List<Article> articles = queryArticles(config);
        preview.setTotalArticleCount(articles.size());
        
        // 收集分类
        Map<Long, Category> categoryMap = new HashMap<>();
        Set<Long> categoryIds = articles.stream()
                .map(Article::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        if (!categoryIds.isEmpty()) {
            List<Category> categories = categoryMapper.selectBatchIds(categoryIds);
            categoryMap = categories.stream()
                    .collect(Collectors.toMap(Category::getId, c -> c));
        }
        
        // 统计分类下的文章数量
        Map<Long, Integer> categoryArticleCount = articles.stream()
                .filter(a -> a.getCategoryId() != null)
                .collect(Collectors.groupingBy(
                        Article::getCategoryId,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
        
        // 构建分类预览
        List<MarkdownExportPreview.ExportCategoryPreview> categoryPreviews = new ArrayList<>();
        for (Map.Entry<Long, Category> entry : categoryMap.entrySet()) {
            MarkdownExportPreview.ExportCategoryPreview cp = new MarkdownExportPreview.ExportCategoryPreview();
            cp.setId(entry.getKey());
            cp.setName(entry.getValue().getName());
            cp.setPath(sanitizeFileName(entry.getValue().getName()));
            cp.setArticleCount(categoryArticleCount.getOrDefault(entry.getKey(), 0));
            categoryPreviews.add(cp);
        }
        preview.setCategories(categoryPreviews);
        
        // 构建文章预览
        int totalAssetCount = 0;
        long estimatedSize = 0;
        List<MarkdownExportPreview.ExportArticlePreview> articlePreviews = new ArrayList<>();
        
        for (Article article : articles) {
            MarkdownExportPreview.ExportArticlePreview ap = new MarkdownExportPreview.ExportArticlePreview();
            ap.setId(article.getId());
            ap.setTitle(article.getTitle());
            ap.setStatus(article.getStatus() == 1 ? "已发布" : "草稿");
            ap.setCreateTime(article.getCreateTime() != null 
                    ? article.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) 
                    : null);
            
            // 计算分类
            if (article.getCategoryId() != null && categoryMap.containsKey(article.getCategoryId())) {
                ap.setCategory(categoryMap.get(article.getCategoryId()).getName());
            }
            
            // 计算目标路径
            ap.setTargetPath(calculateTargetPath(article, categoryMap, config));
            
            // 统计资源数量
            int assetCount = countAssets(article.getContent());
            ap.setAssetCount(assetCount);
            totalAssetCount += assetCount;
            
            // 估算大小
            if (article.getContent() != null) {
                estimatedSize += article.getContent().getBytes(StandardCharsets.UTF_8).length;
            }
            
            articlePreviews.add(ap);
        }
        
        preview.setArticles(articlePreviews);
        preview.setTotalAssetCount(totalAssetCount);
        preview.setEstimatedSize(estimatedSize);
        
        return preview;
    }

    @Override
    public MarkdownExportResult export(MarkdownExportConfig config) throws Exception {
        long startTime = System.currentTimeMillis();
        MarkdownExportResult result = new MarkdownExportResult();
        result.setArticles(new ArrayList<>());
        result.setErrors(new ArrayList<>());
        
        // 查询文章
        List<Article> articles = queryArticles(config);
        
        if (articles.isEmpty()) {
            result.setStatus(MarkdownExportResult.ExportStatus.FAILED);
            MarkdownExportResult.ExportError error = new MarkdownExportResult.ExportError();
            error.setMessage("没有找到要导出的文章");
            error.setErrorType("NO_ARTICLES");
            result.getErrors().add(error);
            return result;
        }
        
        // 收集分类和标签
        Map<Long, Category> categoryMap = loadCategories(articles);
        Map<Long, List<Tag>> articleTagsMap = loadArticleTags(articles);
        
        // 创建临时目录
        String taskId = UUID.randomUUID().toString();
        Path tempDir = Paths.get(exportTempDir, taskId);
        Files.createDirectories(tempDir);
        
        int successCount = 0;
        int failedCount = 0;
        int exportedAssetCount = 0;
        
        try {
            // 导出每篇文章
            for (Article article : articles) {
                try {
                    String targetPath = calculateTargetPath(article, categoryMap, config);
                    Path articlePath = tempDir.resolve(targetPath);
                    Files.createDirectories(articlePath.getParent());
                    
                    // 处理内容
                    String content = article.getContent() != null ? article.getContent() : "";
                    int assetCount = 0;
                    
                    // 处理资源
                    if (config.isIncludeAssets() && config.getAssetMode() == MarkdownExportConfig.AssetMode.DOWNLOAD) {
                        Path assetDir = articlePath.getParent().resolve(config.getAssetDirectory());
                        ProcessedContent processed = processAssets(content, assetDir, article.getId());
                        content = processed.content;
                        assetCount = processed.assetCount;
                        exportedAssetCount += assetCount;
                    } else if (config.getAssetMode() == MarkdownExportConfig.AssetMode.RELATIVE_PATH) {
                        content = convertToRelativePaths(content, config.getAssetDirectory());
                    }
                    
                    // 生成 frontmatter
                    String fullContent;
                    if (config.isIncludeFrontmatter()) {
                        String frontmatter = generateFrontmatter(article, categoryMap, articleTagsMap);
                        fullContent = frontmatter + "\n" + content;
                    } else {
                        fullContent = content;
                    }
                    
                    // 写入文件
                    Files.writeString(articlePath, fullContent, StandardCharsets.UTF_8);
                    
                    // 记录成功
                    MarkdownExportResult.ExportedArticle exported = new MarkdownExportResult.ExportedArticle();
                    exported.setArticleId(article.getId());
                    exported.setTitle(article.getTitle());
                    exported.setTargetPath(targetPath);
                    exported.setAssetCount(assetCount);
                    if (article.getCategoryId() != null && categoryMap.containsKey(article.getCategoryId())) {
                        exported.setCategory(categoryMap.get(article.getCategoryId()).getName());
                    }
                    result.getArticles().add(exported);
                    successCount++;
                    
                } catch (Exception e) {
                    log.error("导出文章失败: {}", article.getTitle(), e);
                    MarkdownExportResult.ExportError error = new MarkdownExportResult.ExportError();
                    error.setArticleId(article.getId());
                    error.setTitle(article.getTitle());
                    error.setMessage(e.getMessage());
                    error.setErrorType("EXPORT_ERROR");
                    result.getErrors().add(error);
                    failedCount++;
                }
            }
            
            // 生成 README 文件
            generateReadme(tempDir, articles.size(), successCount, categoryMap.size());
            
            // 打包为 ZIP
            Path zipFile = Paths.get(exportTempDir, taskId + ".zip");
            createZip(tempDir, zipFile);
            
            // 设置结果
            result.setTaskId(taskId);
            result.setDownloadUrl("/api/admin/post/export-md/download/" + taskId);
            result.setSuccessCount(successCount);
            result.setFailedCount(failedCount);
            result.setExportedAssetCount(exportedAssetCount);
            result.setTotalSize(Files.size(zipFile));
            result.setDuration(System.currentTimeMillis() - startTime);
            
            if (failedCount == 0) {
                result.setStatus(MarkdownExportResult.ExportStatus.SUCCESS);
            } else if (successCount > 0) {
                result.setStatus(MarkdownExportResult.ExportStatus.PARTIAL_SUCCESS);
            } else {
                result.setStatus(MarkdownExportResult.ExportStatus.FAILED);
            }
            
        } finally {
            // 清理临时目录（保留 ZIP 文件）
            deleteDirectory(tempDir);
        }
        
        return result;
    }

    @Override
    public Resource getExportFile(String taskId) {
        Path zipFile = Paths.get(exportTempDir, taskId + ".zip");
        if (!Files.exists(zipFile)) {
            return null;
        }
        return new FileSystemResource(zipFile);
    }

    @Override
    @Scheduled(cron = "0 0 * * * *") // 每小时执行一次
    public void cleanExpiredExports() {
        try {
            Path exportDir = Paths.get(exportTempDir);
            if (!Files.exists(exportDir)) {
                return;
            }
            
            long expireTime = System.currentTimeMillis() - expireHours * 60 * 60 * 1000L;
            
            Files.list(exportDir)
                    .filter(path -> path.toString().endsWith(".zip"))
                    .filter(path -> {
                        try {
                            return Files.getLastModifiedTime(path).toMillis() < expireTime;
                        } catch (IOException e) {
                            return false;
                        }
                    })
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                            log.info("清理过期导出文件: {}", path);
                        } catch (IOException e) {
                            log.error("删除文件失败: {}", path, e);
                        }
                    });
        } catch (IOException e) {
            log.error("清理导出文件失败", e);
        }
    }

    /**
     * 查询要导出的文章
     */
    private List<Article> queryArticles(MarkdownExportConfig config) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        
        // 按文章ID筛选
        if (config.getArticleIds() != null && !config.getArticleIds().isEmpty()) {
            wrapper.in(Article::getId, config.getArticleIds());
        }
        
        // 按分类筛选 - 只有明确指定了分类ID才筛选
        if (config.getCategoryIds() != null && !config.getCategoryIds().isEmpty()) {
            wrapper.in(Article::getCategoryId, config.getCategoryIds());
        }
        
        // 按状态筛选
        if (config.getStatuses() != null && !config.getStatuses().isEmpty()) {
            // 显式传递了状态列表
            wrapper.in(Article::getStatus, config.getStatuses());
            log.info("按状态筛选: {}", config.getStatuses());
        } else if (!config.isExportDrafts()) {
            // 没有传状态列表，且不导出草稿，只查已发布
            wrapper.eq(Article::getStatus, ArticleStatus.PUBLISHED.getCode());
            log.info("默认只导出已发布文章");
        } else {
            // 没有传状态列表，但要导出草稿，查询所有状态（除私密）
            wrapper.in(Article::getStatus, 0, 1);
            log.info("导出草稿和已发布文章");
        }
        
        // 按类型筛选 - 只有明确指定了类型才筛选
        if (StringUtils.hasText(config.getType())) {
            wrapper.eq(Article::getType, config.getType());
        }
        
        wrapper.orderByDesc(Article::getCreateTime);
        
        List<Article> articles = articleMapper.selectList(wrapper);
        log.info("查询到 {} 篇文章", articles.size());
        
        return articles;
    }

    /**
     * 加载分类信息
     */
    private Map<Long, Category> loadCategories(List<Article> articles) {
        Set<Long> categoryIds = articles.stream()
                .map(Article::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        if (categoryIds.isEmpty()) {
            return new HashMap<>();
        }
        
        return categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
    }

    /**
     * 加载文章的标签
     */
    private Map<Long, List<Tag>> loadArticleTags(List<Article> articles) {
        Map<Long, List<Tag>> result = new HashMap<>();
        
        for (Article article : articles) {
            List<Long> tagIds = articleTagMapper.selectTagIdsByArticleId(article.getId());
            if (tagIds != null && !tagIds.isEmpty()) {
                List<Tag> tags = tagMapper.selectBatchIds(tagIds);
                result.put(article.getId(), tags);
            } else {
                result.put(article.getId(), new ArrayList<>());
            }
        }
        
        return result;
    }

    /**
     * 计算文章的导出目标路径
     */
    private String calculateTargetPath(Article article, Map<Long, Category> categoryMap, MarkdownExportConfig config) {
        StringBuilder path = new StringBuilder();
        
        // 目录结构
        switch (config.getDirectoryMode()) {
            case BY_CATEGORY:
                if (article.getCategoryId() != null && categoryMap.containsKey(article.getCategoryId())) {
                    path.append(sanitizeFileName(categoryMap.get(article.getCategoryId()).getName()));
                } else {
                    path.append("未分类");
                }
                path.append("/");
                break;
            case BY_DATE:
                if (article.getCreateTime() != null) {
                    path.append(article.getCreateTime().format(DateTimeFormatter.ofPattern("yyyy/MM")));
                } else {
                    path.append("unknown");
                }
                path.append("/");
                break;
            case FLAT:
            default:
                // 不添加目录
                break;
        }
        
        // 文件名
        String fileName;
        switch (config.getFileNameMode()) {
            case SLUG:
                fileName = StringUtils.hasText(article.getSlug()) ? article.getSlug() : article.getTitle();
                break;
            case ID_TITLE:
                fileName = article.getId() + "-" + article.getTitle();
                break;
            case TITLE:
            default:
                fileName = article.getTitle();
                break;
        }
        
        path.append(sanitizeFileName(fileName)).append(".md");
        return path.toString();
    }

    /**
     * 统计内容中的资源数量
     */
    private int countAssets(String content) {
        if (content == null) return 0;
        int count = 0;
        
        Matcher mdMatcher = IMAGE_PATTERN.matcher(content);
        while (mdMatcher.find()) count++;
        
        Matcher imgMatcher = IMG_TAG_PATTERN.matcher(content);
        while (imgMatcher.find()) count++;
        
        return count;
    }

    /**
     * 处理资源下载
     */
    private ProcessedContent processAssets(String content, Path assetDir, Long articleId) {
        ProcessedContent result = new ProcessedContent();
        result.content = content;
        result.assetCount = 0;
        
        if (content == null) return result;
        
        Set<String> processedUrls = new HashSet<>();
        Map<String, String> urlMapping = new HashMap<>();
        
        // 提取所有图片 URL
        List<String[]> images = new ArrayList<>();
        Matcher mdMatcher = IMAGE_PATTERN.matcher(content);
        while (mdMatcher.find()) {
            images.add(new String[]{mdMatcher.group(0), mdMatcher.group(1), mdMatcher.group(2)});
        }
        
        // 下载并替换
        for (String[] image : images) {
            String fullMatch = image[0];
            String alt = image[1];
            String url = image[2];
            
            if (processedUrls.contains(url)) {
                // 已处理过，直接替换
                if (urlMapping.containsKey(url)) {
                    content = content.replace(fullMatch, "![" + alt + "](" + urlMapping.get(url) + ")");
                }
                continue;
            }
            processedUrls.add(url);
            
            try {
                String localPath = downloadAsset(url, assetDir, articleId);
                if (localPath != null) {
                    urlMapping.put(url, localPath);
                    content = content.replace(fullMatch, "![" + alt + "](" + localPath + ")");
                    result.assetCount++;
                }
            } catch (Exception e) {
                log.warn("下载资源失败: {}", url, e);
            }
        }
        
        result.content = content;
        return result;
    }

    /**
     * 下载资源文件
     */
    private String downloadAsset(String url, Path assetDir, Long articleId) throws Exception {
        if (url == null || url.trim().isEmpty()) return null;
        
        // 跳过 base64 图片
        if (url.startsWith("data:")) return null;
        
        // 确保 assetDir 存在
        Files.createDirectories(assetDir);
        
        // 生成文件名
        String fileName = extractFileName(url);
        if (fileName == null || fileName.isEmpty()) {
            fileName = "image-" + System.currentTimeMillis() + ".png";
        }
        fileName = articleId + "-" + fileName;
        
        Path targetFile = assetDir.resolve(sanitizeFileName(fileName));
        
        // 下载文件
        URL imageUrl = new URL(url);
        try (InputStream in = imageUrl.openStream();
             OutputStream out = new FileOutputStream(targetFile.toFile())) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
        
        // 返回相对路径
        return "assets/" + targetFile.getFileName().toString();
    }

    /**
     * 从 URL 提取文件名
     */
    private String extractFileName(String url) {
        try {
            String path = new URL(url).getPath();
            int lastSlash = path.lastIndexOf('/');
            if (lastSlash >= 0 && lastSlash < path.length() - 1) {
                return path.substring(lastSlash + 1);
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    /**
     * 转换为相对路径
     */
    private String convertToRelativePaths(String content, String assetDirectory) {
        // 简单实现：保持原样
        return content;
    }

    /**
     * 生成 YAML Frontmatter
     */
    private String generateFrontmatter(Article article, Map<Long, Category> categoryMap, Map<Long, List<Tag>> articleTagsMap) {
        StringBuilder sb = new StringBuilder();
        sb.append("---\n");
        
        sb.append("title: \"").append(escapeYaml(article.getTitle())).append("\"\n");
        
        if (StringUtils.hasText(article.getSlug())) {
            sb.append("slug: \"").append(escapeYaml(article.getSlug())).append("\"\n");
        }
        
        if (article.getCreateTime() != null) {
            sb.append("date: ").append(article.getCreateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        }
        
        if (article.getUpdateTime() != null) {
            sb.append("updated: ").append(article.getUpdateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        }
        
        if (article.getCategoryId() != null && categoryMap.containsKey(article.getCategoryId())) {
            sb.append("category: \"").append(escapeYaml(categoryMap.get(article.getCategoryId()).getName())).append("\"\n");
        }
        
        List<Tag> tags = articleTagsMap.get(article.getId());
        if (tags != null && !tags.isEmpty()) {
            sb.append("tags:\n");
            for (Tag tag : tags) {
                sb.append("  - \"").append(escapeYaml(tag.getName())).append("\"\n");
            }
        }
        
        if (StringUtils.hasText(article.getExcerpt())) {
            sb.append("excerpt: \"").append(escapeYaml(article.getExcerpt())).append("\"\n");
        }
        
        if (StringUtils.hasText(article.getCover())) {
            sb.append("cover: \"").append(escapeYaml(article.getCover())).append("\"\n");
        }
        
        sb.append("status: \"").append(article.getStatus() == 1 ? "published" : "draft").append("\"\n");
        
        if (StringUtils.hasText(article.getType())) {
            sb.append("type: \"").append(article.getType().toLowerCase()).append("\"\n");
        }
        
        if (article.getIsTop() != null && article.getIsTop() == 1) {
            sb.append("isTop: true\n");
        }
        
        sb.append("---\n");
        return sb.toString();
    }

    /**
     * 生成 README 文件
     */
    private void generateReadme(Path dir, int totalArticles, int exportedArticles, int categoryCount) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("# Blog Export\n\n");
        sb.append("导出时间: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
        sb.append("## 统计\n\n");
        sb.append("- 文章数量: ").append(exportedArticles).append(" / ").append(totalArticles).append("\n");
        sb.append("- 分类数量: ").append(categoryCount).append("\n\n");
        sb.append("## 目录结构\n\n");
        sb.append("```\n");
        sb.append("├── README.md          # 本说明文件\n");
        sb.append("├── [分类名称]/        # 按分类组织的文章目录\n");
        sb.append("│   ├── [文章名].md    # Markdown 文章\n");
        sb.append("│   └── assets/        # 文章关联资源\n");
        sb.append("└── ...\n");
        sb.append("```\n\n");
        sb.append("## 导入说明\n\n");
        sb.append("您可以使用博客后台的「导入 Markdown」功能重新导入这些文章。\n");
        
        Files.writeString(dir.resolve("README.md"), sb.toString(), StandardCharsets.UTF_8);
    }

    /**
     * 创建 ZIP 文件
     */
    private void createZip(Path sourceDir, Path zipFile) throws IOException {
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipFile.toFile()))) {
            Files.walk(sourceDir)
                    .filter(path -> !Files.isDirectory(path))
                    .forEach(path -> {
                        ZipEntry zipEntry = new ZipEntry(sourceDir.relativize(path).toString());
                        try {
                            zos.putNextEntry(zipEntry);
                            Files.copy(path, zos);
                            zos.closeEntry();
                        } catch (IOException e) {
                            log.error("添加文件到 ZIP 失败: {}", path, e);
                        }
                    });
        }
    }

    /**
     * 删除目录
     */
    private void deleteDirectory(Path dir) {
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                        .sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                log.warn("删除文件失败: {}", path);
                            }
                        });
            }
        } catch (IOException e) {
            log.error("删除目录失败: {}", dir, e);
        }
    }

    /**
     * 清理文件名中的非法字符
     */
    private String sanitizeFileName(String name) {
        if (name == null) return "unknown";
        return name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
    }

    /**
     * 转义 YAML 字符串
     */
    private String escapeYaml(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    /**
     * 处理后的内容
     */
    private static class ProcessedContent {
        String content;
        int assetCount;
    }
}

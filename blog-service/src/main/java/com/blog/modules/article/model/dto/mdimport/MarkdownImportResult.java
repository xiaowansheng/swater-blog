package com.blog.modules.article.model.dto.mdimport;

import lombok.Data;
import java.util.*;

/**
 * Markdown 导入结果
 */
@Data
public class MarkdownImportResult {

    /**
     * 导入状态
     */
    private ImportStatus status;

    /**
     * 成功导入的文章数量
     */
    private Integer successCount = 0;

    /**
     * 失败的文章数量
     */
    private Integer failedCount = 0;

    /**
     * 跳过的文章数量
     */
    private Integer skippedCount = 0;

    /**
     * 创建的分类数量
     */
    private Integer createdCategoryCount = 0;

    /**
     * 导入的资源文件数量
     */
    private Integer importedAssetCount = 0;

    /**
     * 导入的文章列表
     */
    private List<ImportedArticle> articles = new ArrayList<>();

    /**
     * 创建的分类列表
     */
    private List<CreatedCategory> categories = new ArrayList<>();

    /**
     * 错误信息列表
     */
    private List<ImportError> errors = new ArrayList<>();

    /**
     * 总耗时（毫秒）
     */
    private Long duration;

    /**
     * 添加成功的文章
     */
    public void addSuccessArticle(ImportedArticle article) {
        this.articles.add(article);
        this.successCount++;
    }

    /**
     * 添加失败的文章
     */
    public void addFailedArticle(String filename, String errorMessage) {
        ImportError error = new ImportError();
        error.setFilename(filename);
        error.setMessage(errorMessage);
        error.setErrorType(ErrorType.PARSE_ERROR);
        this.errors.add(error);
        this.failedCount++;
    }

    /**
     * 添加跳过的文章
     */
    public void addSkippedArticle(String filename, String reason) {
        ImportError error = new ImportError();
        error.setFilename(filename);
        error.setMessage(reason);
        error.setErrorType(ErrorType.SKIPPED);
        this.errors.add(error);
        this.skippedCount++;
    }

    /**
     * 添加创建的分类
     */
    public void addCreatedCategory(CreatedCategory category) {
        this.categories.add(category);
        this.createdCategoryCount++;
    }

    /**
     * 上传的资源文件列表
     */
    private List<UploadedAsset> uploadedAssets = new ArrayList<>();

    /**
     * 添加上传的资源文件
     */
    public void addUploadedAsset(String originalPath, String newUrl) {
        UploadedAsset asset = new UploadedAsset();
        asset.setOriginalPath(originalPath);
        asset.setNewUrl(newUrl);
        this.uploadedAssets.add(asset);
        this.importedAssetCount++;
    }

    /**
     * 是否有错误
     */
    public boolean hasErrors() {
        return !errors.isEmpty();
    }

    /**
     * 导入状态枚举
     */
    public enum ImportStatus {
        /**
         * 成功
         */
        SUCCESS,

        /**
         * 部分成功
         */
        PARTIAL_SUCCESS,

        /**
         * 失败
         */
        FAILED
    }

    /**
     * 错误类型
     */
    public enum ErrorType {
        /**
         * 解析错误
         */
        PARSE_ERROR,

        /**
         * 文件读取错误
         */
        FILE_READ_ERROR,

        /**
         * 分类创建错误
         */
        CATEGORY_ERROR,

        /**
         * 文章创建错误
         */
        ARTICLE_CREATE_ERROR,

        /**
         * 资源文件上传错误
         */
        ASSET_UPLOAD_ERROR,

        /**
         * 跳过
         */
        SKIPPED
    }

    /**
     * 导入的文章信息
     */
    @Data
    public static class ImportedArticle {
        /**
         * 原始文件名
         */
        private String originalFilename;

        /**
         * 文章 ID
         */
        private Long articleId;

        /**
         * 文章标题
         */
        private String title;

        /**
         * 文章 slug
         */
        private String slug;

        /**
         * 分类 ID
         */
        private Long categoryId;

        /**
         * 分类名称
         */
        private String categoryName;

        /**
         * 标签列表
         */
        private List<String> tags;

        /**
         * 状态
         */
        private String status;

        /**
         * 是否包含资源文件
         */
        private Boolean hasAssets = false;

        /**
         * 资源文件数量
         */
        private Integer assetCount = 0;
    }

    /**
     * 创建的分类信息
     */
    @Data
    public static class CreatedCategory {
        /**
         * 分类 ID
         */
        private Long categoryId;

        /**
         * 分类 key
         */
        private String categoryKey;

        /**
         * 分类名称
         */
        private String name;

        /**
         * 父分类 ID
         */
        private Long parentId;

        /**
         * 层级
         */
        private Integer level;

        /**
         * 文章数量
         */
        private Integer articleCount = 0;
    }

    /**
     * 错误信息
     */
    @Data
    public static class ImportError {
        /**
         * 文件名
         */
        private String filename;

        /**
         * 错误消息
         */
        private String message;

        /**
         * 错误类型
         */
        private ErrorType errorType;

        /**
         * 堆栈跟踪（可选，用于调试）
         */
        private String stackTrace;
    }

    /**
     * 上传的资源文件信息
     */
    @Data
    public static class UploadedAsset {
        /**
         * 原始路径
         */
        private String originalPath;

        /**
         * 新的 URL
         */
        private String newUrl;
    }
}

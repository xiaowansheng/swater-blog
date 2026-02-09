package com.blog.modules.article.model.dto.mdexport;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * Markdown 导出结果
 */
@Data
public class MarkdownExportResult {

    /**
     * 导出状态
     */
    public enum ExportStatus {
        SUCCESS,
        PARTIAL_SUCCESS,
        FAILED
    }

    private ExportStatus status;

    /**
     * 任务ID（用于下载）
     */
    private String taskId;

    /**
     * 下载链接
     */
    private String downloadUrl;

    /**
     * 成功导出数量
     */
    private int successCount;

    /**
     * 失败数量
     */
    private int failedCount;

    /**
     * 跳过数量
     */
    private int skippedCount;

    /**
     * 导出资源数量
     */
    private int exportedAssetCount;

    /**
     * 文件大小 (bytes)
     */
    private long totalSize;

    /**
     * 耗时 (ms)
     */
    private long duration;

    /**
     * 导出的文章列表
     */
    private List<ExportedArticle> articles = new ArrayList<>();

    /**
     * 错误信息列表
     */
    private List<ExportError> errors = new ArrayList<>();

    /**
     * 已导出的文章
     */
    @Data
    public static class ExportedArticle {
        private Long articleId;
        private String title;
        private String targetPath;
        private String category;
        private int assetCount;
    }

    /**
     * 导出错误
     */
    @Data
    public static class ExportError {
        private Long articleId;
        private String title;
        private String message;
        private String errorType;
    }
}

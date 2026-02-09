package com.blog.modules.article.model.dto.mdexport;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * Markdown 导出预览
 */
@Data
public class MarkdownExportPreview {

    /**
     * 文章总数
     */
    private int totalArticleCount;

    /**
     * 静态资源总数
     */
    private int totalAssetCount;

    /**
     * 预估文件大小 (bytes)
     */
    private long estimatedSize;

    /**
     * 文章预览列表
     */
    private List<ExportArticlePreview> articles = new ArrayList<>();

    /**
     * 分类预览列表
     */
    private List<ExportCategoryPreview> categories = new ArrayList<>();

    /**
     * 警告信息（如资源不可访问等）
     */
    private List<String> warnings = new ArrayList<>();

    /**
     * 文章导出预览
     */
    @Data
    public static class ExportArticlePreview {
        private Long id;
        private String title;
        private String category;
        private String targetPath;      // 导出目标路径
        private int assetCount;         // 关联资源数量
        private String status;
        private String createTime;
    }

    /**
     * 分类导出预览
     */
    @Data
    public static class ExportCategoryPreview {
        private Long id;
        private String name;
        private String path;            // 导出目录路径
        private int articleCount;
    }
}

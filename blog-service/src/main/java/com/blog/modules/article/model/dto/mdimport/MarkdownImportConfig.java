package com.blog.modules.article.model.dto.mdimport;

import lombok.Data;
import com.blog.modules.article.util.AssetPathProcessor;

/**
 * Markdown 导入配置
 */
@Data
public class MarkdownImportConfig {

    /**
     * 分类映射模式
     */
    private CategoryMode categoryMode = CategoryMode.AUTO;

    /**
     * 手动指定的分类 ID（当 categoryMode = MANUAL 时使用）
     */
    private Long manualCategoryId;

    /**
     * 是否自动创建不存在的分类
     */
    private Boolean autoCreateCategory = true;

    /**
     * 是否覆盖已存在的分类
     */
    private Boolean overwriteCategory = false;

    /**
     * 资源文件处理模式
     */
    private AssetPathProcessor.ProcessMode assetMode = AssetPathProcessor.ProcessMode.ABSOLUTE_URL;

    /**
     * CDN 域名（用于生成绝对 URL）
     */
    private String cdnDomain = "";

    /**
     * 基础存储路径
     */
    private String basePath = "articles";

    /**
     * Base64 转换阈值（字节）
     */
    private Long base64Threshold = 102400L; // 100KB

    /**
     * 文章默认状态
     */
    private ArticleStatus defaultStatus = ArticleStatus.DRAFT;

    /**
     * 是否保留原始 frontmatter
     */
    private Boolean preserveFrontmatter = true;

    /**
     * 作者 ID（默认为当前登录用户）
     */
    private Long authorId;

    /**
     * 是否导入资源文件
     */
    private Boolean importAssets = true;

    /**
     * 文章类型
     */
    private String articleType = "post";

    /**
     * 重复处理策略
     */
    private DuplicateResolution duplicateResolution = DuplicateResolution.SKIP;

    /**
     * 分类映射模式枚举
     */
    public enum CategoryMode {
        /**
         * 自动创建分类（根据目录结构）
         */
        AUTO,

        /**
         * 手动指定统一分类
         */
        MANUAL,

        /**
         * 仅使用 frontmatter 中的分类
         */
        FRONTMATTER
    }

    /**
     * 文章状态枚举
     */
    public enum ArticleStatus {
        /**
         * 草稿
         */
        DRAFT,

        /**
         * 已发布
         */
        PUBLISHED
    }

    /**
     * 重复处理策略枚举
     */
    public enum DuplicateResolution {
        /**
         * 跳过
         */
        SKIP,

        /**
         * 覆盖（更新现有文章）
         */
        OVERWRITE,

        /**
         * 重命名（自动生成新 Slug）
         */
        RENAME
    }
}

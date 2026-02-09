package com.blog.modules.article.model.dto.mdexport;

import lombok.Data;
import java.util.List;

/**
 * Markdown 导出配置
 */
@Data
public class MarkdownExportConfig {

    /**
     * 指定导出的文章ID（为空则导出全部）
     */
    private List<Long> articleIds;

    /**
     * 按分类筛选
     */
    private List<Long> categoryIds;

    /**
     * 按状态筛选 0-草稿 1-已发布
     */
    private List<Integer> statuses;

    /**
     * 文章类型: ORIGINAL, REPRINT, TRANSLATE
     */
    private String type;

    /**
     * 目录结构模式
     */
    public enum DirectoryMode {
        FLAT,           // 扁平结构，所有 MD 在同一目录
        BY_CATEGORY,    // 按分类创建目录
        BY_DATE         // 按日期创建目录 (年/月)
    }
    private DirectoryMode directoryMode = DirectoryMode.BY_CATEGORY;

    /**
     * 文件命名模式
     */
    public enum FileNameMode {
        TITLE,          // 使用文章标题
        SLUG,           // 使用 slug
        ID_TITLE        // ID-标题 格式
    }
    private FileNameMode fileNameMode = FileNameMode.TITLE;

    /**
     * 是否包含 YAML frontmatter
     */
    private boolean includeFrontmatter = true;

    /**
     * 是否包含静态资源
     */
    private boolean includeAssets = true;

    /**
     * 是否导出草稿
     */
    private boolean exportDrafts = false;

    /**
     * 资源处理模式
     */
    public enum AssetMode {
        DOWNLOAD,       // 下载所有引用的资源到 assets 目录
        KEEP_URL,       // 保持原始 URL 不变
        RELATIVE_PATH   // 转换为相对路径
    }
    private AssetMode assetMode = AssetMode.DOWNLOAD;

    /**
     * 资源目录名称
     */
    private String assetDirectory = "assets";
}

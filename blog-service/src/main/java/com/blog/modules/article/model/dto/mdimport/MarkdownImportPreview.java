package com.blog.modules.article.model.dto.mdimport;

import com.blog.modules.article.util.MarkdownParser;
import lombok.Data;
import java.util.*;

/**
 * Markdown 导入预览
 */
@Data
public class MarkdownImportPreview {

    /**
     * 文件总数
     */
    private Integer totalFileCount = 0;

    /**
     * MD 文件数量
     */
    private Integer mdFileCount = 0;

    /**
     * 资源文件数量
     */
    private Integer assetFileCount = 0;

    /**
     * 将创建的文章数量
     */
    private Integer articleCount = 0;

    /**
     * 将创建的分类数量
     */
    private Integer categoryCount = 0;

    /**
     * 文件结构预览
     */
    private FileStructurePreview fileStructure;

    /**
     * 分类预览
     */
    private List<CategoryPreview> categories = new ArrayList<>();

    /**
     * 文章预览列表
     */
    private List<ArticlePreview> articles = new ArrayList<>();

    /**
     * 解析的文档列表
     */
    private List<ParsedDocument> documents = new ArrayList<>();

    /**
     * 警告信息
     */
    private List<String> warnings = new ArrayList<>();

    /**
     * 文件结构预览
     */
    @Data
    public static class FileStructurePreview {
        /**
         * 基础路径
         */
        private String basePath;

        /**
         * 目录树
         */
        private List<TreeNode> tree;

        /**
         * 树节点
         */
        @Data
        public static class TreeNode {
            /**
             * 节点名称
             */
            private String name;

            /**
             * 节点类型：file 或 directory
             */
            private String type;

            /**
             * 路径
             */
            private String path;

            /**
             * 子节点
             */
            private List<TreeNode> children = new ArrayList<>();

            /**
             * MD 文件解析结果（仅 file 类型的 MD 文件）
             */
            private ArticlePreview articleInfo;
        }
    }

    /**
     * 分类预览
     */
    @Data
    public static class CategoryPreview {
        /**
         * 分类 key
         */
        private String categoryKey;

        /**
         * 分类名称
         */
        private String name;

        /**
         * 父分类 key
         */
        private String parentKey;

        /**
         * 层级
         */
        private Integer level;

        /**
         * 完整路径（如：Java > Spring）
         */
        private String fullPath;

        /**
         * 文章数量
         */
        private Integer articleCount = 0;

        /**
         * 是否已存在
         */
        private Boolean exists = false;

        /**
         * 是否将新建
         */
        private Boolean willCreate = false;
    }

    /**
     * 文章预览
     */
    @Data
    public static class ArticlePreview {
        /**
         * 原始文件名
         */
        private String originalFilename;

        /**
         * 文件路径
         */
        private String filePath;

        /**
         * 标题（从 frontmatter 或文件名提取）
         */
        private String title;

        /**
         * Slug
         */
        private String slug;

        /**
         * 分类
         */
        private String category;

        /**
         * 分类 key
         */
        private String categoryKey;

        /**
         * 标签
         */
        private List<String> tags = new ArrayList<>();

        /**
         * 摘要
         */
        private String excerpt;

        /**
         * 封面图片
         */
        private String cover;

        /**
         * 是否有 frontmatter
         */
        private Boolean hasFrontmatter = false;

        /**
         * 是否是草稿
         */
        private Boolean isDraft = false;

        /**
         * 资源文件数量
         */
        private Integer assetCount = 0;

        /**
         * 资源文件列表
         */
        private List<String> assets = new ArrayList<>();

        /**
         * 内容长度（字符数）
         */
        private Integer contentLength = 0;

        /**
         * 图片数量
         */
        private Integer imageCount = 0;
    }

    /**
     * 解析的文档
     */
    @Data
    public static class ParsedDocument {
        /**
         * 文件名
         */
        private String filename;

        /**
         * 文件路径
         */
        private String filePath;

        /**
         * 解析后的文档
         */
        private MarkdownParser.MarkdownDocument document;

        /**
         * 文章预览信息
         */
        private ArticlePreview preview;

        /**
         * 关联的分类 key
         */
        private String categoryKey;

        /**
         * 错误信息（如果有）
         */
        private String error;
    }

    /**
     * 添加警告
     */
    public void addWarning(String warning) {
        this.warnings.add(warning);
    }

    /**
     * 获取统计信息
     */
    public String getStatisticsSummary() {
        return String.format(
            "将创建 %d 篇文章，%d 个分类，导入 %d 个资源文件",
            articleCount,
            categoryCount,
            assetFileCount
        );
    }

    /**
     * 构建目录树
     */
    public void buildFileTree(List<String> filePaths) {
        FileStructurePreview structure = new FileStructurePreview();
        structure.setTree(new ArrayList<>());

        for (String filePath : filePaths) {
            String[] parts = filePath.split("/");
            addToTree(structure.getTree(), parts, 0, filePath);
        }

        this.fileStructure = structure;
    }

    /**
     * 递归添加到树
     */
    private void addToTree(
            List<FileStructurePreview.TreeNode> tree,
            String[] parts,
            int index,
            String fullPath
    ) {
        if (index >= parts.length) {
            return;
        }

        String part = parts[index];
        boolean isFile = index == parts.length - 1;

        // 查找或创建节点
        FileStructurePreview.TreeNode node = tree.stream()
                .filter(n -> n.getName().equals(part))
                .findFirst()
                .orElse(null);

        if (node == null) {
            node = new FileStructurePreview.TreeNode();
            node.setName(part);
            node.setType(isFile ? "file" : "directory");
            node.setPath(fullPath);
            tree.add(node);
        }

        // 递归处理子节点
        if (!isFile && index + 1 < parts.length) {
            addToTree(node.getChildren(), parts, index + 1, fullPath);
        }
    }
}

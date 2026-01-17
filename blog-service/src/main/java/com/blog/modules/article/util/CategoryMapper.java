package com.blog.modules.article.util;

import com.blog.modules.category.model.entity.Category;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 分类映射工具
 * 用于从 MD 文件路径构建分类层级结构
 */
@Slf4j
public class CategoryMapper {

    /**
     * 构建分类层级结构
     *
     * @param basePath 基础路径，如 "docs/"
     * @param filePaths 文件路径列表，如 ["docs/java/basic.md", "docs/spring/ioc.md"]
     * @return 分类映射结果
     */
    public static CategoryMappingResult buildCategoryHierarchy(String basePath, List<String> filePaths) {
        CategoryMappingResult result = new CategoryMappingResult();
        Map<String, CategoryNode> categoryMap = new LinkedHashMap<>();
        Map<String, List<String>> fileToCategoryMap = new LinkedHashMap<>();

        for (String filePath : filePaths) {
            // 移除基础路径
            String relativePath = filePath;
            if (StringUtils.hasText(basePath) && filePath.startsWith(basePath)) {
                relativePath = filePath.substring(basePath.length());
            }

            // 分割路径
            String[] parts = relativePath.split("/");
            if (parts.length < 1) {
                continue;
            }

            // 提取目录部分（不包括文件名）
            List<String> dirParts = new ArrayList<>();
            for (int i = 0; i < parts.length - 1; i++) {
                String part = parts[i].trim();
                if (!part.isEmpty()) {
                    dirParts.add(part);
                }
            }

            // 如果有目录，构建分类层级
            if (!dirParts.isEmpty()) {
                buildCategoryNodes(dirParts, categoryMap, result);
            }

            // 记录文件到分类的映射
            String fileKey = parts[parts.length - 1];
            String categoryKey = dirParts.isEmpty() ? null : buildCategoryKey(dirParts);
            fileToCategoryMap.put(fileKey, categoryKey == null ? Collections.emptyList() : Collections.singletonList(categoryKey));
        }

        result.setCategoryMap(categoryMap);
        result.setFileToCategoryMap(fileToCategoryMap);
        return result;
    }

    /**
     * 构建分类节点
     */
    private static void buildCategoryNodes(List<String> dirParts, Map<String, CategoryNode> categoryMap, CategoryMappingResult result) {
        CategoryNode parent = null;
        StringBuilder keyBuilder = new StringBuilder();
        StringBuilder namePathBuilder = new StringBuilder();

        for (int i = 0; i < dirParts.size(); i++) {
            String dirName = dirParts.get(i);

            // 构建 category_key
            if (i > 0) {
                keyBuilder.append("-");
                namePathBuilder.append(" > ");
            }
            keyBuilder.append(dirName.toLowerCase().replaceAll("\\s+", "-"));
            namePathBuilder.append(dirName);

            String categoryKey = keyBuilder.toString();
            String namePath = namePathBuilder.toString();

            CategoryNode node = categoryMap.get(categoryKey);
            if (node == null) {
                node = new CategoryNode();
                node.setKey(categoryKey);
                node.setName(dirName);
                node.setNamePath(namePath);
                node.setLevel(i);
                node.setParent(parent != null ? parent.getKey() : null);
                categoryMap.put(categoryKey, node);
                result.getCategories().add(node);
            }

            parent = node;
        }
    }

    /**
     * 构建分类 key
     */
    private static String buildCategoryKey(List<String> dirParts) {
        return dirParts.stream()
                .map(part -> part.toLowerCase().replaceAll("\\s+", "-"))
                .collect(Collectors.joining("-"));
    }

    /**
     * 将分类节点转换为 Category 实体
     */
    public static List<Category> convertToEntities(List<CategoryNode> nodes, Map<String, Long> existingCategoryKeys) {
        List<Category> categories = new ArrayList<>();

        for (CategoryNode node : nodes) {
            // 如果分类已存在，跳过
            if (existingCategoryKeys != null && existingCategoryKeys.containsKey(node.getKey())) {
                continue;
            }

            Category category = new Category();
            category.setCategoryKey(node.getKey());
            category.setName(node.getName());
            category.setSlug(toSlug(node.getName()));
            category.setDescription("自动创建的分类: " + node.getNamePath());
            category.setStatus("ACTIVE");
            category.setSort(node.getLevel() * 100);

            // 设置父分类 ID
            if (StringUtils.hasText(node.getParent())) {
                Long parentId = existingCategoryKeys != null ? existingCategoryKeys.get(node.getParent()) : null;
                if (parentId != null) {
                    category.setParentId(parentId);
                }
            }

            categories.add(category);
        }

        return categories;
    }

    /**
     * 转换为 slug
     */
    private static String toSlug(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\u4e00-\\u9fa5\\s-]", "")
                .replaceAll("[\\s_]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    /**
     * 从 frontmatter 获取分类
     */
    public static String getCategoryFromFrontmatter(MarkdownParser.Frontmatter frontmatter) {
        if (frontmatter == null || !StringUtils.hasText(frontmatter.getCategory())) {
            return null;
        }
        return frontmatter.getCategory();
    }

    /**
     * 解析多级分类（如 "Java/Spring"）
     */
    public static List<String> parseMultiLevelCategory(String categoryStr) {
        if (!StringUtils.hasText(categoryStr)) {
            return new ArrayList<>();
        }

        List<String> categories = new ArrayList<>();
        String[] parts = categoryStr.split("[/\\\\|]");

        for (String part : parts) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                categories.add(trimmed);
            }
        }

        return categories;
    }

    /**
     * 获取文件的分类（优先级：frontmatter > 目录映射）
     */
    public static String resolveFileCategory(
            String filePath,
            MarkdownParser.Frontmatter frontmatter,
            CategoryMappingResult mappingResult
    ) {
        // 1. 优先使用 frontmatter
        String frontmatterCategory = getCategoryFromFrontmatter(frontmatter);
        if (StringUtils.hasText(frontmatterCategory)) {
            return frontmatterCategory;
        }

        // 2. 使用目录映射
        if (mappingResult != null && mappingResult.getFileToCategoryMap() != null) {
            String fileName = extractFileName(filePath);
            List<String> categories = mappingResult.getFileToCategoryMap().get(fileName);
            if (!CollectionUtils.isEmpty(categories)) {
                return categories.get(0);
            }
        }

        return null;
    }

    /**
     * 提取文件名
     */
    private static String extractFileName(String filePath) {
        if (!StringUtils.hasText(filePath)) {
            return "";
        }

        int lastSlash = filePath.lastIndexOf("/");
        if (lastSlash < 0) {
            lastSlash = filePath.lastIndexOf("\\");
        }

        return lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
    }

    /**
     * 分类节点
     */
    @Data
    public static class CategoryNode {
        private String key;           // category_key，如 "java-spring"
        private String name;          // 分类名称，如 "Spring"
        private String namePath;      // 完整路径，如 "Java > Spring"
        private Integer level;        // 层级，从 0 开始
        private String parent;        // 父分类的 key
    }

    /**
     * 分类映射结果
     */
    @Data
    public static class CategoryMappingResult {
        private List<CategoryNode> categories = new ArrayList<>();
        private Map<String, CategoryNode> categoryMap = new LinkedHashMap<>();
        private Map<String, List<String>> fileToCategoryMap = new LinkedHashMap<>();

        /**
         * 获取所有分类 key
         */
        public Set<String> getAllCategoryKeys() {
            return categoryMap.keySet();
        }

        /**
         * 根据文件名获取分类
         */
        public List<String> getCategoryForFile(String fileName) {
            return fileToCategoryMap.getOrDefault(fileName, new ArrayList<>());
        }

        /**
         * 添加分类
         */
        public void addCategory(CategoryNode node) {
            categories.add(node);
            categoryMap.put(node.getKey(), node);
        }
    }
}

package com.blog.modules.article.util;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Markdown 解析器
 * 用于解析 MD 文件的 frontmatter 和内容
 */
@Slf4j
public class MarkdownParser {

    private static final Pattern FRONTMATTER_PATTERN = Pattern.compile("^---\\s*\\n([\\s\\S]*?)\\n---\\s*\\n?");
    private static final Pattern IMAGE_PATTERN = Pattern.compile("!\\[.*?]\\(([^)]+)\\)");
    private static final Pattern TAGS_PATTERN = Pattern.compile("\\[(.*?)]");

    /**
     * 解析 MD 文件
     */
    public static MarkdownDocument parse(MultipartFile file) throws IOException {
        MarkdownDocument document = new MarkdownDocument();
        document.setOriginalFilename(file.getOriginalFilename());

        String content = readFileContent(file);
        document.setRawContent(content);

        // 提取 frontmatter
        Frontmatter frontmatter = extractFrontmatter(content);
        document.setFrontmatter(frontmatter);

        // 提取正文内容（去除 frontmatter）
        String bodyContent = removeFrontmatter(content);
        document.setContent(bodyContent);

        // 提取图片引用
        List<String> images = extractImages(bodyContent);
        document.setImages(images);

        return document;
    }

    /**
     * 解析 MD 文件（字符串内容）
     */
    public static MarkdownDocument parse(String filename, String content) {
        MarkdownDocument document = new MarkdownDocument();
        document.setOriginalFilename(filename);
        document.setRawContent(content);

        // 提取 frontmatter
        Frontmatter frontmatter = extractFrontmatter(content);
        document.setFrontmatter(frontmatter);

        // 提取正文内容
        String bodyContent = removeFrontmatter(content);
        document.setContent(bodyContent);

        // 提取图片引用
        List<String> images = extractImages(bodyContent);
        document.setImages(images);

        return document;
    }

    /**
     * 读取文件内容
     */
    private static String readFileContent(MultipartFile file) throws IOException {
        StringBuilder content = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
        }
        return content.toString();
    }

    /**
     * 提取 frontmatter
     */
    private static Frontmatter extractFrontmatter(String content) {
        Frontmatter frontmatter = new Frontmatter();
        Matcher matcher = FRONTMATTER_PATTERN.matcher(content);

        if (!matcher.find()) {
            return frontmatter;
        }

        String frontmatterText = matcher.group(1);
        Map<String, String> data = parseYamlLikeFrontmatter(frontmatterText);

        // 解析各个字段
        frontmatter.setTitle(data.get("title"));
        frontmatter.setDate(parseDate(data.get("date")));
        frontmatter.setCategory(data.get("category"));
        frontmatter.setTags(parseTags(data.get("tags")));
        frontmatter.setDraft(parseBoolean(data.get("draft"), false));
        frontmatter.setDescription(data.get("description") != null ? data.get("description") : data.get("excerpt"));
        frontmatter.setCover(data.get("cover"));
        frontmatter.setSlug(data.get("slug"));

        return frontmatter;
    }

    /**
     * 解析 YAML 风格的 frontmatter（简化版）
     */
    private static Map<String, String> parseYamlLikeFrontmatter(String text) {
        Map<String, String> result = new HashMap<>();
        String[] lines = text.split("\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }

            int colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                String key = line.substring(0, colonIndex).trim();
                String value = line.substring(colonIndex + 1).trim();
                result.put(key, value);
            }
        }

        return result;
    }

    /**
     * 解析日期
     */
    private static LocalDateTime parseDate(String dateStr) {
        if (!StringUtils.hasText(dateStr)) {
            return null;
        }

        try {
            // 尝试解析多种日期格式
            DateTimeFormatter[] formatters = {
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ISO_LOCAL_DATE_TIME,
                DateTimeFormatter.ISO_LOCAL_DATE
            };

            for (DateTimeFormatter formatter : formatters) {
                try {
                    if (formatter.toString().contains("HH:mm")) {
                        return LocalDateTime.parse(dateStr, formatter);
                    } else {
                        return LocalDate.parse(dateStr, formatter).atStartOfDay();
                    }
                } catch (Exception e) {
                    // 继续尝试下一个格式
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse date: {}", dateStr, e);
        }

        return null;
    }

    /**
     * 解析标签
     */
    private static List<String> parseTags(String tagsStr) {
        if (!StringUtils.hasText(tagsStr)) {
            return new ArrayList<>();
        }

        List<String> tags = new ArrayList<>();

        // 格式: [tag1, tag2, tag3]
        if (tagsStr.startsWith("[") && tagsStr.endsWith("]")) {
            String content = tagsStr.substring(1, tagsStr.length() - 1);
            String[] parts = content.split(",");
            for (String part : parts) {
                String tag = part.trim();
                if (!tag.isEmpty()) {
                    tags.add(tag);
                }
            }
        } else {
            // 格式: tag1, tag2, tag3
            String[] parts = tagsStr.split(",");
            for (String part : parts) {
                String tag = part.trim();
                if (!tag.isEmpty()) {
                    tags.add(tag);
                }
            }
        }

        return tags;
    }

    /**
     * 解析布尔值
     */
    private static Boolean parseBoolean(String value, Boolean defaultValue) {
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value);
    }

    /**
     * 移除 frontmatter
     */
    private static String removeFrontmatter(String content) {
        Matcher matcher = FRONTMATTER_PATTERN.matcher(content);
        return matcher.replaceFirst("");
    }

    /**
     * 提取图片引用
     */
    public static List<String> extractImages(String content) {
        List<String> images = new ArrayList<>();
        Matcher matcher = IMAGE_PATTERN.matcher(content);

        while (matcher.find()) {
            String imagePath = matcher.group(1).trim();
            images.add(imagePath);
        }

        return images;
    }

    /**
     * 替换图片路径为绝对 URL
     */
    public static String replaceImageUrls(String content, String basePath, String cdnDomain) {
        Matcher matcher = IMAGE_PATTERN.matcher(content);
        StringBuffer result = new StringBuffer();

        while (matcher.find()) {
            String originalPath = matcher.group(1).trim();

            // 跳过已经是绝对路径的 URL
            if (originalPath.startsWith("http://") || originalPath.startsWith("https://") || originalPath.startsWith("data:")) {
                matcher.appendReplacement(result, matcher.group(0));
                continue;
            }

            // 跳过 base64 图片
            if (originalPath.startsWith("data:image")) {
                matcher.appendReplacement(result, matcher.group(0));
                continue;
            }

            // 处理相对路径
            String absoluteUrl = cdnDomain + "/" + basePath + "/" + originalPath;
            absoluteUrl = absoluteUrl.replaceAll("/+", "/"); // 规范化多个斜杠

            matcher.appendReplacement(result, "![" + matcher.group(1) + "](" + absoluteUrl + ")");
        }

        return matcher.appendTail(result).toString();
    }

    /**
     * 生成文章 slug
     */
    public static String generateSlug(String title) {
        if (!StringUtils.hasText(title)) {
            return "untitled-" + System.currentTimeMillis();
        }

        // 转换为小写，替换空格和特殊字符为连字符
        String slug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\u4e00-\\u9fa5\\s-]", "")
                .replaceAll("[\\s_]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        return slug.isEmpty() ? "untitled-" + System.currentTimeMillis() : slug;
    }

    /**
     * 生成文章摘要
     */
    public static String generateExcerpt(String content, int maxLength) {
        if (!StringUtils.hasText(content)) {
            return "";
        }

        // 移除 Markdown 语法
        String excerpt = content
                .replaceAll("#+\\s+", "") // 标题
                .replaceAll("!\\[.*?]\\([^)]+\\)", "") // 图片
                .replaceAll("\\*\\*.*?\\*\\*", "") // 粗体
                .replaceAll("\\*.*?\\*", "") // 斜体
                .replaceAll("`[^`]+`", "") // 代码
                .replaceAll("\\[([^]]+)\\]\\([^)]+\\)", "$1") // 链接
                .replaceAll("\\n+", " ")
                .trim();

        // 截取指定长度
        if (excerpt.length() > maxLength) {
            excerpt = excerpt.substring(0, maxLength) + "...";
        }

        return excerpt;
    }

    /**
     * Frontmatter 数据类
     */
    @Data
    public static class Frontmatter {
        private String title;
        private LocalDateTime date;
        private String category;
        private List<String> tags = new ArrayList<>();
        private Boolean draft;
        private String description;
        private String cover;
        private String slug;
    }

    /**
     * Markdown 文档数据类
     */
    @Data
    public static class MarkdownDocument {
        private String originalFilename;
        private String rawContent;
        private Frontmatter frontmatter = new Frontmatter();
        private String content;
        private List<String> images = new ArrayList<>();
    }
}

package com.blog.modules.file.util;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 内容图片URL提取工具类
 * 用于从 Markdown 和 HTML 内容中提取图片链接
 */
public class ContentImageExtractor {

    // Markdown 图片语法：![alt](url)
    private static final Pattern MARKDOWN_IMAGE_PATTERN = Pattern.compile("!\\[.*?\\]\\(([^)]+)\\)");

    // HTML <img> 标签
    private static final Pattern HTML_IMG_PATTERN = Pattern.compile("<img[^>]+src\\s*=\\s*['\"]([^'\"]+)['\"][^>]*>", Pattern.CASE_INSENSITIVE);

    // HTML background-image 样式
    private static final Pattern HTML_BG_IMAGE_PATTERN = Pattern.compile("background-image\\s*:\\s*url\\(['\"]?([^'\")]+)['\"]?\\)", Pattern.CASE_INSENSITIVE);

    /**
     * 从内容中提取所有图片URL
     * @param content 内容（支持 Markdown 和 HTML）
     * @return 图片URL集合（去重）
     */
    public static Set<String> extractImageUrls(String content) {
        Set<String> urls = new HashSet<>();

        if (content == null || content.isEmpty()) {
            return urls;
        }

        // 提取 Markdown 格式的图片
        extractMarkdownImages(content, urls);

        // 提取 HTML 格式的图片
        extractHtmlImages(content, urls);

        return urls;
    }

    /**
     * 提取 Markdown 格式的图片
     */
    private static void extractMarkdownImages(String content, Set<String> urls) {
        Matcher matcher = MARKDOWN_IMAGE_PATTERN.matcher(content);
        while (matcher.find()) {
            String url = matcher.group(1);
            if (isValidImageUrl(url)) {
                urls.add(url);
            }
        }
    }

    /**
     * 提取 HTML 格式的图片
     */
    private static void extractHtmlImages(String content, Set<String> urls) {
        // 提取 <img> 标签
        Matcher imgMatcher = HTML_IMG_PATTERN.matcher(content);
        while (imgMatcher.find()) {
            String url = imgMatcher.group(1);
            if (isValidImageUrl(url)) {
                urls.add(url);
            }
        }

        // 提取 background-image 样式
        Matcher bgMatcher = HTML_BG_IMAGE_PATTERN.matcher(content);
        while (bgMatcher.find()) {
            String url = bgMatcher.group(1);
            if (isValidImageUrl(url)) {
                urls.add(url);
            }
        }
    }

    /**
     * 判断是否为有效的图片URL
     */
    private static boolean isValidImageUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }

        url = url.trim();

        // 过滤掉非HTTP协议的URL
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return false;
        }

        // 过滤掉base64图片
        if (url.startsWith("data:image")) {
            return false;
        }

        // 可选：检查文件扩展名
        String[] imageExtensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"};
        for (String ext : imageExtensions) {
            if (url.toLowerCase().contains(ext)) {
                return true;
            }
        }

        // 如果没有扩展名，也可能是动态图片URL，仍然接受
        return true;
    }

    /**
     * 提取图片URL列表
     */
    public static List<String> extractImageUrlsAsList(String content) {
        return new ArrayList<>(extractImageUrls(content));
    }
}

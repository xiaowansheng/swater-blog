package com.blog.modules.article.util;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 静态资源路径处理器
 * 用于处理 MD 文件中的图片、文件等资源路径
 */
@Slf4j
public class AssetPathProcessor {

    private static final Pattern IMAGE_PATTERN = Pattern.compile("!\\[([^\\]]*)]\\(([^)]+)\\)");
    private static final Pattern LINK_PATTERN = Pattern.compile("\\[([^\\]]+)\\]\\(([^)]+)\\)");
    private static final Pattern ABSOLUTE_URL_PATTERN = Pattern.compile("^(https?://|data:image|//)");

    /**
     * 处理模式
     */
    public enum ProcessMode {
        RELATIVE_PATH,      // 保留相对路径
        ABSOLUTE_URL,       // 替换为绝对 URL
        BASE64              // 转换为 Base64（小图片）
    }

    /**
     * 处理 MD 内容中的资源路径
     *
     * @param content MD 内容
     * @param mdFilePath MD 文件的相对路径
     * @param mode 处理模式
     * @param config 配置
     * @return 处理后的内容
     */
    public static ProcessResult processContent(
            String content,
            String mdFilePath,
            ProcessMode mode,
            ProcessConfig config
    ) {
        ProcessResult result = new ProcessResult();
        StringBuilder processedContent = new StringBuilder(content);

        // 提取所有图片引用
        List<AssetReference> images = extractImages(content);
        result.setImages(images);

        // 根据模式处理
        switch (mode) {
            case RELATIVE_PATH:
                // 保留相对路径，只需规范化
                processedContent = new StringBuilder(normalizePaths(content, mdFilePath));
                break;

            case ABSOLUTE_URL:
                // 替换为绝对 URL
                processedContent = replaceWithAbsoluteUrls(content, images, mdFilePath, config);
                result.setProcessedAssets(true);
                break;

            case BASE64:
                // 部分转换为 Base64
                processedContent = convertSmallImagesToBase64(content, images, config);
                result.setProcessedAssets(true);
                break;
        }

        result.setContent(processedContent.toString());
        return result;
    }

    /**
     * 提取所有图片引用
     */
    public static List<AssetReference> extractImages(String content) {
        List<AssetReference> images = new ArrayList<>();
        Matcher matcher = IMAGE_PATTERN.matcher(content);

        while (matcher.find()) {
            String alt = matcher.group(1);
            String path = matcher.group(2).trim();

            AssetReference ref = new AssetReference();
            ref.setAlt(alt);
            ref.setOriginalPath(path);
            ref.setAbsolutePath(resolveAbsolutePath(path));
            ref.setBase64Encoded(path.startsWith("data:image"));

            images.add(ref);
        }

        return images;
    }

    /**
     * 解析绝对路径
     */
    public static String resolveAbsolutePath(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return "";
        }

        // 如果已经是绝对路径或 Base64
        if (ABSOLUTE_URL_PATTERN.matcher(relativePath).find()) {
            return relativePath;
        }

        // 规范化相对路径
        Path path = Paths.get(relativePath).normalize();
        return path.toString().replace("\\", "/");
    }

    /**
     * 规范化路径（处理 ../ 和 ./）
     */
    public static String normalizePaths(String content, String mdFilePath) {
        Matcher matcher = IMAGE_PATTERN.matcher(content);
        StringBuilder result = new StringBuilder();

        String mdDir = getParentDir(mdFilePath);

        while (matcher.find()) {
            String alt = matcher.group(1);
            String path = matcher.group(2).trim();

            // 跳过绝对路径
            if (ABSOLUTE_URL_PATTERN.matcher(path).find()) {
                matcher.appendReplacement(result, matcher.group(0));
                continue;
            }

            // 解析相对路径
            String resolvedPath = resolveRelativePath(mdDir, path);
            matcher.appendReplacement(result, "![" + alt + "](" + resolvedPath + ")");
        }

        return matcher.appendTail(result).toString();
    }

    /**
     * 替换为绝对 URL
     */
    private static StringBuilder replaceWithAbsoluteUrls(
            String content,
            List<AssetReference> images,
            String mdFilePath,
            ProcessConfig config
    ) {
        Matcher matcher = IMAGE_PATTERN.matcher(content);
        StringBuilder result = new StringBuilder();

        String mdDir = getParentDir(mdFilePath);

        while (matcher.find()) {
            String alt = matcher.group(1);
            String path = matcher.group(2).trim();

            // 跳过绝对路径和 Base64
            if (ABSOLUTE_URL_PATTERN.matcher(path).find()) {
                matcher.appendReplacement(result, matcher.group(0));
                continue;
            }

            // 解析相对路径
            String resolvedPath = resolveRelativePath(mdDir, path);

            // 构建绝对 URL
            String absoluteUrl = config.getCdnDomain() + "/" + config.getBasePath() + "/" + resolvedPath;
            absoluteUrl = absoluteUrl.replaceAll("/+", "/"); // 移除重复的斜杠

            matcher.appendReplacement(result, "![" + alt + "](" + absoluteUrl + ")");
        }

        return new StringBuilder(matcher.appendTail(result).toString());
    }

    /**
     * 转换小图片为 Base64
     */
    private static StringBuilder convertSmallImagesToBase64(
            String content,
            List<AssetReference> images,
            ProcessConfig config
    ) {
        // 这个方法需要实际的文件内容，这里只做标记
        // 实际实现需要在调用方提供文件读取能力
        log.warn("Base64 conversion requires file content access");
        return new StringBuilder(content);
    }

    /**
     * 解析相对路径
     */
    public static String resolveRelativePath(String baseDir, String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return "";
        }

        // 移除开头的 ./ 或 .\
        relativePath = relativePath.replaceAll("^[./\\\\]+", "");

        // 合并基础目录和相对路径
        if (StringUtils.hasText(baseDir)) {
            String combined = baseDir + "/" + relativePath;
            Path path = Paths.get(combined).normalize();
            return path.toString().replace("\\", "/");
        }

        return relativePath;
    }

    /**
     * 获取父目录
     */
    public static String getParentDir(String filePath) {
        if (!StringUtils.hasText(filePath)) {
            return "";
        }

        int lastSlash = filePath.lastIndexOf("/");
        if (lastSlash < 0) {
            lastSlash = filePath.lastIndexOf("\\");
        }

        return lastSlash >= 0 ? filePath.substring(0, lastSlash) : "";
    }

    /**
     * 生成资源文件的存储路径
     */
    public static String generateStoragePath(String basePath, String mdFilePath, String assetRelativePath) {
        String mdDir = getParentDir(mdFilePath);
        String resolvedPath = resolveRelativePath(mdDir, assetRelativePath);

        return (basePath + "/" + resolvedPath).replaceAll("/+", "/");
    }

    /**
     * 批量生成存储路径
     */
    public static Map<String, String> generateStoragePaths(
            String basePath,
            Map<String, String> mdFileToAssetsMap
    ) {
        Map<String, String> storagePaths = new HashMap<>();

        for (Map.Entry<String, String> entry : mdFileToAssetsMap.entrySet()) {
            String mdFilePath = entry.getKey();
            String assetPath = entry.getValue();

            String storagePath = generateStoragePath(basePath, mdFilePath, assetPath);
            storagePaths.put(assetPath, storagePath);
        }

        return storagePaths;
    }

    /**
     * 分析文件结构，提取所有资源文件
     */
    public static FileStructureAnalysis analyzeFileStructure(
            String basePath,
            List<String> mdFilePaths,
            List<String> allFilePaths
    ) {
        FileStructureAnalysis analysis = new FileStructureAnalysis();
        Map<String, List<String>> mdToAssetsMap = new HashMap<>();
        Set<String> assetPaths = new HashSet<>();

        for (String mdPath : mdFilePaths) {
            List<String> assets = new ArrayList<>();

            // 读取 MD 文件内容（这里需要实际的文件读取）
            // 暂时根据路径推断可能的资源文件
            String mdDir = getParentDir(mdPath);

            // 查找同目录下的 assets、images、img 文件夹
            for (String filePath : allFilePaths) {
                if (filePath.equals(mdPath)) {
                    continue;
                }

                // 检查是否是可能的资源文件
                if (isAssetFile(filePath) && isInSameOrSubDirectory(mdDir, filePath)) {
                    assets.add(filePath);
                    assetPaths.add(filePath);
                }
            }

            mdToAssetsMap.put(mdPath, assets);
        }

        analysis.setMdToAssetsMap(mdToAssetsMap);
        analysis.setAllAssetPaths(assetPaths);
        analysis.setAssetCount(assetPaths.size());

        return analysis;
    }

    /**
     * 判断是否是资源文件
     */
    private static boolean isAssetFile(String filePath) {
        String lower = filePath.toLowerCase();
        return lower.endsWith(".png") ||
               lower.endsWith(".jpg") ||
               lower.endsWith(".jpeg") ||
               lower.endsWith(".gif") ||
               lower.endsWith(".svg") ||
               lower.endsWith(".webp") ||
               lower.endsWith(".bmp");
    }

    /**
     * 判断是否在同一目录或子目录
     */
    private static boolean isInSameOrSubDirectory(String baseDir, String filePath) {
        if (!StringUtils.hasText(baseDir)) {
            return true;
        }

        String fileDir = getParentDir(filePath);
        return fileDir.equals(baseDir) || fileDir.startsWith(baseDir + "/");
    }

    /**
     * 资源引用
     */
    @Data
    public static class AssetReference {
        private String alt;              // 图片 alt 文本
        private String originalPath;     // 原始路径
        private String absolutePath;     // 解析后的绝对路径
        private Boolean base64Encoded;   // 是否是 Base64 编码
        private Long fileSize;           // 文件大小（用于 Base64 转换判断）
        private String storagePath;      // 存储路径
    }

    /**
     * 处理配置
     */
    @Data
    public static class ProcessConfig {
        private String basePath = "articles";      // 基础路径
        private String cdnDomain = "";             // CDN 域名
        private Long base64Threshold = 102400L;    // Base64 转换阈值（100KB）
    }

    /**
     * 处理结果
     */
    @Data
    public static class ProcessResult {
        private String content;                    // 处理后的内容
        private List<AssetReference> images;       // 所有图片引用
        private Boolean processedAssets = false;   // 是否处理了资源
    }

    /**
     * 文件结构分析结果
     */
    @Data
    public static class FileStructureAnalysis {
        private Map<String, List<String>> mdToAssetsMap;  // MD 文件到资源的映射
        private Set<String> allAssetPaths;                // 所有资源文件路径
        private Integer assetCount;                       // 资源文件数量
    }
}

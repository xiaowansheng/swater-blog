package com.blog.plugin.components.storage.impl;



import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.blog.bootstrap.config.WebMvcConfig;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.storage.StoragePlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
@Component
@ConditionalOnProperty(name = "plugin.storage.active", havingValue = "local", matchIfMissing = false)
public class LocalStoragePlugin implements StoragePlugin, Plugin {

    @Autowired
    private WebMvcConfig webMvcConfig;
    
    private static final Logger logger = LoggerFactory.getLogger(LocalStoragePlugin.class);
    
//    @Value("${file.storage.local.path:uploads}")
//    private String uploadDir;
//
//    @Value("${file.storage.local.url-prefix:}")
//    private String urlPrefix;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    
    @Override
    public String getName() {
        return "local";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public String upload(MultipartFile file, String filePath) throws Exception {
        Path uploadPath = Paths.get(webMvcConfig.getUploadDir()).toAbsolutePath().resolve(filePath);
        logger.info("正在上传文件到本地: {}", uploadPath);
        Files.createDirectories(uploadPath.getParent());
        Files.copy(file.getInputStream(), uploadPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        return filePath;
    }
    
    @Override
    public String upload(InputStream inputStream, String filePath, long contentLength, String contentType) throws Exception {
        Path uploadPath = Paths.get(webMvcConfig.getUploadDir()).toAbsolutePath().resolve(filePath);
        logger.info("正在上传文件流到本地: {}", uploadPath);
        Files.createDirectories(uploadPath.getParent());
        Files.copy(inputStream, uploadPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        return filePath;
    }
    
    @Override
    public void delete(String filePath) throws Exception {
        if (StrUtil.isNotBlank(filePath)) {
            Path path = Paths.get(webMvcConfig.getUploadDir()).toAbsolutePath().resolve(filePath);
            Files.deleteIfExists(path);
        }
    }
    
    @Override
    public String getUrl(String filePath) {
        if (StrUtil.isBlank(filePath)) {
            return null;
        }
        String normalizedPath = filePath.replace("\\", "/");
        if (!normalizedPath.startsWith("/")) {
            normalizedPath = "/" + normalizedPath;
        }
        return normalizedPath;
    }
    
    @Override
    public String generateFilePath(String originalFilename) {
        return generateFilePath(originalFilename, null, null);
    }

    @Override
    public String generateFilePath(String originalFilename, String category) {
        return generateFilePath(originalFilename, category, null);
    }

    /**
     * 生成文件路径
     * @param originalFilename 原始文件名
     * @param fileHash 文件内容哈希（SHA256），如果为null则使用UUID
     * @return 文件路径，格式：original/image/2026/0118/hash.jpg
     */
    @Override
    public String generateFilePath(String originalFilename, String category, String fileHash) {
        // 第一层：文件版本（默认original）
        String version = StrUtil.isBlank(category) ? "original" : category;

        // 第二层：文件类型
        String fileType = getFileType(originalFilename);

        // 第三层：日期目录
        String dateDir = LocalDate.now().format(DATE_FORMATTER);

        // 第四层：文件名
        String extension = FileUtil.extName(originalFilename);
        String filename;
        if (StrUtil.isNotBlank(fileHash)) {
            // 使用SHA256哈希的前16位作为文件名
            filename = fileHash.substring(0, 16) + "." + extension;
        } else {
            // 如果没有提供哈希，使用UUID
            filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        }

        return version + "/" + fileType + "/" + dateDir + "/" + filename;
    }

    @Override
    public String calculateHash(MultipartFile file) throws Exception {
        return DigestUtil.sha256Hex(file.getInputStream());
    }

    /**
     * 根据文件扩展名获取文件类型目录名
     * @param filename 文件名
     * @return 文件类型目录名
     */
    private String getFileType(String filename) {
        if (StrUtil.isBlank(filename)) {
            return "other";
        }
        String extension = FileUtil.extName(filename).toLowerCase();

        // 图片类型
        if (extension.matches("jpg|jpeg|png|gif|webp|bmp|svg|ico")) {
            return "image";
        }
        // 视频类型
        else if (extension.matches("mp4|avi|mov|wmv|flv|mkv|webm")) {
            return "video";
        }
        // 音频类型
        else if (extension.matches("mp3|wav|flac|aac|ogg|wma|m4a")) {
            return "audio";
        }
        // 文档类型
        else if (extension.matches("pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md")) {
            return "document";
        }
        // 压缩包
        else if (extension.matches("zip|rar|7z|tar|gz")) {
            return "archive";
        }
        // 其他
        else {
            return "other";
        }
    }
    
    @Override
    public boolean exists(String filePath) throws Exception {
        Path path = Paths.get(webMvcConfig.getUploadDir()).toAbsolutePath().resolve(filePath);
        return Files.exists(path);
    }
}

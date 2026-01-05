package com.blog.plugin.components.storage.impl;



import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.storage.StoragePlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@ConditionalOnProperty(name = "file.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStoragePlugin implements StoragePlugin, Plugin {
    
    private static final Logger logger = LoggerFactory.getLogger(LocalStoragePlugin.class);
    
    @Value("${file.storage.local.path:uploads}")
    private String uploadDir;
    
    @Value("${file.storage.local.url-prefix:}")
    private String urlPrefix;
    
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
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().resolve(filePath);
        logger.info("正在上传文件到本地: {}", uploadPath);
        Files.createDirectories(uploadPath.getParent());
        Files.copy(file.getInputStream(), uploadPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        return filePath;
    }
    
    @Override
    public String upload(InputStream inputStream, String filePath, long contentLength, String contentType) throws Exception {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().resolve(filePath);
        logger.info("正在上传文件流到本地: {}", uploadPath);
        Files.createDirectories(uploadPath.getParent());
        Files.copy(inputStream, uploadPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        return filePath;
    }
    
    @Override
    public void delete(String filePath) throws Exception {
        if (StrUtil.isNotBlank(filePath)) {
            Path path = Paths.get(uploadDir).toAbsolutePath().resolve(filePath);
            Files.deleteIfExists(path);
        }
    }
    
    @Override
    public String getUrl(String filePath) {
        if (StrUtil.isBlank(filePath)) {
            return null;
        }
        String normalizedPath = filePath.replace("\\", "/");
        if (StrUtil.isBlank(urlPrefix)) {
            return normalizedPath;
        }
        if (!normalizedPath.startsWith("/")) {
            normalizedPath = "/" + normalizedPath;
        }
        return urlPrefix + normalizedPath;
    }
    
    @Override
    public String generateFilePath(String originalFilename) {
        return generateFilePath(originalFilename, "default");
    }

    @Override
    public String generateFilePath(String originalFilename, String category) {
        String dir = StrUtil.isBlank(category) ? "default" : category;
        String dateDir = LocalDate.now().format(DATE_FORMATTER);
        String extension = FileUtil.extName(originalFilename);
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        return dir + "/" + dateDir + "/" + filename;
    }
    
    @Override
    public String calculateHash(MultipartFile file) throws Exception {
        return DigestUtil.sha256Hex(file.getInputStream());
    }
    
    @Override
    public boolean exists(String filePath) throws Exception {
        Path path = Paths.get(uploadDir).toAbsolutePath().resolve(filePath);
        return Files.exists(path);
    }
}

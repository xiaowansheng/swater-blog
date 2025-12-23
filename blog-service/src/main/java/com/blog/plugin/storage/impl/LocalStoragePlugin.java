package com.blog.plugin.storage.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.storage.StoragePlugin;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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
    
    @Value("${file.storage.local.path:uploads}")
    private String uploadDir;
    
    @Value("${file.storage.local.url-prefix:/uploads}")
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
        Path uploadPath = Paths.get(uploadDir, filePath);
        Files.createDirectories(uploadPath.getParent());
        file.transferTo(uploadPath.toFile());
        return filePath;
    }
    
    @Override
    public String upload(InputStream inputStream, String filePath, long contentLength, String contentType) throws Exception {
        Path uploadPath = Paths.get(uploadDir, filePath);
        Files.createDirectories(uploadPath.getParent());
        Files.copy(inputStream, uploadPath);
        return filePath;
    }
    
    @Override
    public void delete(String filePath) throws Exception {
        if (StrUtil.isNotBlank(filePath)) {
            File file = new File(uploadDir, filePath);
            if (file.exists()) {
                Files.deleteIfExists(file.toPath());
            }
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
        return urlPrefix + normalizedPath;
    }
    
    @Override
    public String generateFilePath(String originalFilename) {
        String dateDir = LocalDate.now().format(DATE_FORMATTER);
        String extension = FileUtil.extName(originalFilename);
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        return dateDir + "/" + filename;
    }
    
    @Override
    public String calculateHash(MultipartFile file) throws Exception {
        return DigestUtil.sha256Hex(file.getInputStream());
    }
    
    @Override
    public boolean exists(String filePath) throws Exception {
        File file = new File(uploadDir, filePath);
        return file.exists();
    }
}

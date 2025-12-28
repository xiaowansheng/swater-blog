package com.blog.plugin.storage.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.PutObjectRequest;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.storage.StoragePlugin;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "file.storage.type", havingValue = "oss")
public class OssStoragePlugin implements StoragePlugin, Plugin {
    
    @Value("${file.storage.oss.endpoint:}")
    private String endpoint;
    
    @Value("${file.storage.oss.access-key-id:}")
    private String accessKeyId;
    
    @Value("${file.storage.oss.access-key-secret:}")
    private String accessKeySecret;
    
    @Value("${file.storage.oss.bucket-name:}")
    private String bucketName;
    
    @Value("${file.storage.oss.domain:}")
    private String domain;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    
    private OSS getOssClient() {
        return new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
    }
    
    @Override
    public String getName() {
        return "oss";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public String upload(MultipartFile file, String filePath) throws Exception {
        OSS ossClient = getOssClient();
        try {
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, filePath, file.getInputStream());
            ossClient.putObject(putObjectRequest);
            return filePath;
        } finally {
            ossClient.shutdown();
        }
    }
    
    @Override
    public String upload(InputStream inputStream, String filePath, long contentLength, String contentType) throws Exception {
        OSS ossClient = getOssClient();
        try {
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, filePath, inputStream);
            ossClient.putObject(putObjectRequest);
            return filePath;
        } finally {
            ossClient.shutdown();
        }
    }
    
    @Override
    public void delete(String filePath) throws Exception {
        OSS ossClient = getOssClient();
        try {
            ossClient.deleteObject(bucketName, filePath);
        } finally {
            ossClient.shutdown();
        }
    }
    
    @Override
    public String getUrl(String filePath) {
        if (StrUtil.isBlank(filePath)) {
            return null;
        }
        if (StrUtil.isNotBlank(domain)) {
            String normalizedPath = filePath.replace("\\", "/");
            if (normalizedPath.startsWith("/")) {
                normalizedPath = normalizedPath.substring(1);
            }
            return domain + "/" + normalizedPath;
        }
        OSS ossClient = getOssClient();
        try {
            return ossClient.generatePresignedUrl(bucketName, filePath, 
                java.util.Date.from(java.time.Instant.now().plusSeconds(3600))).toString();
        } finally {
            ossClient.shutdown();
        }
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
        return cn.hutool.crypto.digest.DigestUtil.sha256Hex(file.getInputStream());
    }
    
    @Override
    public boolean exists(String filePath) throws Exception {
        OSS ossClient = getOssClient();
        try {
            return ossClient.doesObjectExist(bucketName, filePath);
        } finally {
            ossClient.shutdown();
        }
    }
}

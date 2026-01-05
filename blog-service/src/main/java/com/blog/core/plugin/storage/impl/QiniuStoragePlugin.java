package com.blog.core.plugin.storage.impl;



import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.blog.core.plugin.core.Plugin;
import com.blog.core.plugin.storage.StoragePlugin;
import com.qiniu.common.QiniuException;
import com.qiniu.http.Response;
import com.qiniu.storage.Configuration;
import com.qiniu.storage.Region;
import com.qiniu.storage.UploadManager;
import com.qiniu.util.Auth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
@Component
@ConditionalOnProperty(name = "file.storage.type", havingValue = "qiniu")
public class QiniuStoragePlugin implements StoragePlugin, Plugin {
    
    @Value("${file.storage.qiniu.access-key:}")
    private String accessKey;
    
    @Value("${file.storage.qiniu.secret-key:}")
    private String secretKey;
    
    @Value("${file.storage.qiniu.bucket:}")
    private String bucket;
    
    @Value("${file.storage.qiniu.domain:}")
    private String domain;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    
    private Auth getAuth() {
        return Auth.create(accessKey, secretKey);
    }
    
    private UploadManager getUploadManager() {
        Configuration cfg = new Configuration(Region.autoRegion());
        return new UploadManager(cfg);
    }
    
    @Override
    public String getName() {
        return "qiniu";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public String upload(MultipartFile file, String filePath) throws Exception {
        Auth auth = getAuth();
        UploadManager uploadManager = getUploadManager();
        String upToken = auth.uploadToken(bucket);
        try {
            Response response = uploadManager.put(file.getInputStream(), filePath, upToken, null, null);
            if (response.isOK()) {
                return filePath;
            } else {
                throw new Exception("七牛云上传失败: " + response.bodyString());
            }
        } catch (QiniuException ex) {
            throw new Exception("七牛云上传异常: " + ex.getMessage());
        }
    }
    
    @Override
    public String upload(InputStream inputStream, String filePath, long contentLength, String contentType) throws Exception {
        Auth auth = getAuth();
        UploadManager uploadManager = getUploadManager();
        String upToken = auth.uploadToken(bucket);
        try {
            Response response = uploadManager.put(inputStream, filePath, upToken, null, contentType);
            if (response.isOK()) {
                return filePath;
            } else {
                throw new Exception("七牛云上传失败: " + response.bodyString());
            }
        } catch (QiniuException ex) {
            throw new Exception("七牛云上传异常: " + ex.getMessage());
        }
    }
    
    @Override
    public void delete(String filePath) throws Exception {
        // 七牛云删除需要额外SDK支持，这里简化处理
        // 实际使用时建议使用七牛云管理API或SDK的delete方法
        throw new UnsupportedOperationException("七牛云删除功能需要额外实现");
    }
    
    @Override
    public String getUrl(String filePath) {
        if (StrUtil.isBlank(filePath) || StrUtil.isBlank(domain)) {
            return null;
        }
        String normalizedPath = filePath.replace("\\", "/");
        if (normalizedPath.startsWith("/")) {
            normalizedPath = normalizedPath.substring(1);
        }
        if (domain.endsWith("/")) {
            return domain + normalizedPath;
        }
        return domain + "/" + normalizedPath;
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
        // 七牛云检查文件存在需要额外SDK支持
        throw new UnsupportedOperationException("七牛云文件存在检查需要额外实现");
    }
}

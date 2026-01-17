package com.blog.plugin.components.storage.impl;



import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.storage.StoragePlugin;
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
@ConditionalOnProperty(name = "plugin.storage.active", havingValue = "qiniu", matchIfMissing = false)
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
        return generateFilePath(originalFilename, null, null);
    }

    @Override
    public String generateFilePath(String originalFilename, String category) {
        return generateFilePath(originalFilename, category, null);
    }

    /**
     * 生成文件路径
     * @param originalFilename 原始文件名
     * @param version 文件版本（original、thumbnail、temp等），默认original
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
        // 七牛云检查文件存在需要额外SDK支持
        throw new UnsupportedOperationException("七牛云文件存在检查需要额外实现");
    }
}

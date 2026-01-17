package com.blog.plugin.components.storage;


import com.blog.plugin.core.Plugin;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
public interface StoragePlugin extends Plugin {
    String upload(MultipartFile file, String filePath) throws Exception;
    
    String upload(InputStream inputStream, String filePath, long contentLength, String contentType) throws Exception;
    
    void delete(String filePath) throws Exception;
    
    String getUrl(String filePath);
    
    String generateFilePath(String originalFilename);

    String generateFilePath(String originalFilename, String category);

    String generateFilePath(String originalFilename, String category, String fileHash);

    String calculateHash(MultipartFile file) throws Exception;
    
    boolean exists(String filePath) throws Exception;
}

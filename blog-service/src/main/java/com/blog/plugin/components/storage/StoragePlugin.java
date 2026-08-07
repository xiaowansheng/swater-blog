package com.blog.plugin.components.storage;


import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
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

    /**
     * 根据文件扩展名获取文件类型目录名
     * @param filename 文件名
     * @return 文件类型目录名
     */
    default String getFileType(String filename) {
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
}

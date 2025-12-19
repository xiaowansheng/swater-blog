package com.blog.util;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class FileStorageUtil {
    private static final String UPLOAD_DIR = "uploads";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    public static String calculateHash(MultipartFile file) throws IOException {
        return DigestUtil.sha256Hex(file.getInputStream());
    }

    public static String generateFilePath(String originalFilename) {
        String dateDir = LocalDate.now().format(DATE_FORMATTER);
        String extension = FileUtil.extName(originalFilename);
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        return dateDir + "/" + filename;
    }

    public static String saveFile(MultipartFile file, String filePath) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR, filePath);
        Files.createDirectories(uploadPath.getParent());
        file.transferTo(uploadPath.toFile());
        return filePath;
    }

    public static void deleteFile(String filePath) {
        if (StrUtil.isNotBlank(filePath)) {
            File file = new File(UPLOAD_DIR, filePath);
            if (file.exists()) {
                file.delete();
            }
        }
    }

    public static String getFileUrl(String filePath) {
        if (StrUtil.isBlank(filePath)) {
            return null;
        }
        return "/uploads/" + filePath.replace("\\", "/");
    }
}


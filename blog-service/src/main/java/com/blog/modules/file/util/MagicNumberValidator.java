package com.blog.modules.file.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Set;

/**
 * 上传文件魔数（magic bytes）校验：
 * 扩展名可被伪造，读取文件头与声明类型比对，拦截"改名的脚本/可执行文件"。
 * 只对存在可靠魔数的类型做校验；文本类（txt/md）与无法识别的文件头放行，避免误杀。
 */
public final class MagicNumberValidator {

    private MagicNumberValidator() {
    }

    /** 声明扩展名按家族归组：同一家族共享文件头。 */
    private static final Set<String> JPEG = Set.of("jpg", "jpeg");
    private static final Set<String> OFFICE_ZIP = Set.of("docx", "xlsx", "pptx");
    private static final Set<String> ISO_MP4 = Set.of("mp4", "mov");

    /**
     * 校验文件头与声明的扩展名是否匹配。
     *
     * @param header   文件前 16 字节（不足则按实际长度）
     * @param filename 声明的文件名（取扩展名）
     * @return true = 校验通过（匹配或无法校验）；false = 文件头与类型不符
     */
    public static boolean matches(byte[] header, String filename) {
        String ext = extension(filename);
        if (header == null || header.length < 4 || ext.isBlank()) {
            return true;
        }

        if (JPEG.contains(ext)) {
            return startsWith(header, 0xFF, 0xD8, 0xFF);
        }
        if (ext.equals("png")) {
            return startsWith(header, 0x89, 0x50, 0x4E, 0x47);
        }
        if (ext.equals("gif")) {
            return startsWith(header, 'G', 'I', 'F', '8');
        }
        if (ext.equals("bmp")) {
            return startsWith(header, 'B', 'M');
        }
        if (ext.equals("webp")) {
            return startsWith(header, 'R', 'I', 'F', 'F') && at(header, 8, 'W', 'E', 'B', 'P');
        }
        if (ext.equals("pdf")) {
            return startsWith(header, '%', 'P', 'D', 'F');
        }
        if (OFFICE_ZIP.contains(ext)) {
            return startsWith(header, 0x50, 0x4B, 0x03, 0x04) || startsWith(header, 0x50, 0x4B, 0x05, 0x06);
        }
        if (ISO_MP4.contains(ext)) {
            return at(header, 4, 'f', 't', 'y', 'p');
        }
        if (ext.equals("mp3")) {
            return startsWith(header, 'I', 'D', '3') || (unsigned(header[0]) == 0xFF && unsigned(header[1]) != 0x00);
        }
        // txt/md/ico/未知类型无可靠魔数，放行（XSS 由 HtmlSanitizer/前端渲染策略兜底）
        return true;
    }

    /** 便捷方法：从流读取文件头并校验。 */
    public static boolean matches(InputStream in, String filename) throws IOException {
        byte[] header = in.readNBytes(16);
        return matches(header, filename);
    }

    private static String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static boolean startsWith(byte[] data, int... expected) {
        if (data.length < expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if (unsigned(data[i]) != expected[i]) {
                return false;
            }
        }
        return true;
    }

    private static boolean at(byte[] data, int offset, int... expected) {
        if (data.length < offset + expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if (unsigned(data[offset + i]) != expected[i]) {
                return false;
            }
        }
        return true;
    }

    private static int unsigned(byte b) {
        return b & 0xFF;
    }
}

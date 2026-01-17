package com.blog.modules.article.service;

import com.blog.modules.article.model.dto.mdimport.MarkdownImportConfig;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportPreview;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportResult;
import org.springframework.web.multipart.MultipartFile;

/**
 * Markdown 导入服务接口
 */
public interface MarkdownImportService {

    /**
     * 预览导入（解析文件但不创建文章）
     *
     * @param files 上传的文件
     * @param basePath 基础路径
     * @return 导入预览
     */
    MarkdownImportPreview previewImport(MultipartFile[] files, String basePath) throws Exception;

    /**
     * 导入单个 Markdown 文件
     *
     * @param file MD 文件
     * @param config 导入配置
     * @return 导入结果
     */
    MarkdownImportResult importSingleFile(MultipartFile file, MarkdownImportConfig config) throws Exception;

    /**
     * 批量导入 Markdown 文件
     *
     * @param files MD 文件列表
     * @param config 导入配置
     * @return 导入结果
     */
    MarkdownImportResult importBatch(MultipartFile[] files, MarkdownImportConfig config) throws Exception;
}

package com.blog.modules.article.service;

import com.blog.modules.article.model.dto.mdexport.MarkdownExportConfig;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportPreview;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportResult;
import org.springframework.core.io.Resource;

/**
 * Markdown 导出服务接口
 */
public interface MarkdownExportService {

    /**
     * 预览导出内容
     *
     * @param config 导出配置
     * @return 导出预览
     */
    MarkdownExportPreview preview(MarkdownExportConfig config);

    /**
     * 执行导出，生成 ZIP 文件
     *
     * @param config 导出配置
     * @return 导出结果
     */
    MarkdownExportResult export(MarkdownExportConfig config) throws Exception;

    /**
     * 获取导出文件
     *
     * @param taskId 任务ID
     * @return 文件资源
     */
    Resource getExportFile(String taskId);

    /**
     * 清理过期的导出文件
     */
    void cleanExpiredExports();
}

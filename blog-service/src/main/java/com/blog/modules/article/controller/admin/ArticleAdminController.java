package com.blog.modules.article.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.article.model.dto.ArticleDTO;
import com.blog.modules.article.model.dto.ArticleSaveDTO;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.article.model.dto.ArticleQueryDTO;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.article.model.vo.ArticleStatisticsVO;
import com.blog.modules.article.model.vo.ArticleSaveResultVO;
import com.blog.modules.article.service.ArticleCommandService;
import com.blog.modules.article.service.ArticleQueryService;
import com.blog.modules.article.service.ArticleSaveService;
import com.blog.modules.article.service.MarkdownImportService;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportConfig;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportPreview;
import com.blog.modules.article.model.dto.mdimport.MarkdownImportResult;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportConfig;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportPreview;
import com.blog.modules.article.model.dto.mdexport.MarkdownExportResult;
import com.blog.modules.article.service.MarkdownExportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
@RestController
@RequestMapping("/api/admin/post")
@ApiOperation(name = "文章管理模块", description = "文章的增删改查和发布管理", open = false)
public class ArticleAdminController {
    @Autowired
    private ArticleQueryService articleQueryService;

    @Autowired
    private ArticleCommandService articleCommandService;

    @Autowired
    private ArticleSaveService articleSaveService;

    @Autowired
    private MarkdownImportService markdownImportService;

    @Autowired
    private MarkdownExportService markdownExportService;

    @GetMapping("/list")
    @ApiOperation(name = "查询文章列表", type = ApiOperationType.QUERY,
            description = "分页查询文章列表，支持按状态、分类、关键词筛选")
    public Result<PageResult<ArticleVO>> list(ArticleQueryDTO queryDTO) {
        PageResult<ArticleVO> result = articleQueryService.list(queryDTO);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取文章详情", type = ApiOperationType.QUERY,
            description = "根据ID查询单篇文章的详细信息")
    public Result<ArticleVO> getById(@PathVariable Long id) {
        ArticleVO vo = articleQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建文章", type = ApiOperationType.CREATE,
            description = "创建新文章")
    public Result<Long> create(@Valid @RequestBody ArticleDTO dto) {
        Long id = articleCommandService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新文章", type = ApiOperationType.UPDATE,
            description = "更新已存在的文章内容")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ArticleDTO dto) {
        articleCommandService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除文章", type = ApiOperationType.DELETE,
            description = "删除单篇文章")
    public Result<Void> delete(@PathVariable Long id) {
        articleCommandService.delete(id);
        return Result.success();
    }

    @DeleteMapping("/batch")
    @ApiOperation(name = "批量删除文章", type = ApiOperationType.DELETE,
            description = "批量删除多篇文章")
    public Result<Void> deleteBatch(@RequestBody List<Long> ids) {
        articleCommandService.deleteBatch(ids);
        return Result.success();
    }

    @PostMapping("/{id}/publish")
    @ApiOperation(name = "发布文章", type = ApiOperationType.CREATE,
            description = "发布文章使其在前台可见")
    public Result<Void> publish(@PathVariable Long id) {
        articleCommandService.publish(id);
        return Result.success();
    }

    @PostMapping("/{id}/unpublish")
    @ApiOperation(name = "取消发布", type = ApiOperationType.CREATE,
            description = "取消文章发布，使其变为草稿状态")
    public Result<Void> unpublish(@PathVariable Long id) {
        articleCommandService.unpublish(id);
        return Result.success();
    }

    @GetMapping("/statistics")
    @ApiOperation(name = "文章统计", type = ApiOperationType.QUERY,
            description = "获取文章相关统计数据")
    public Result<ArticleStatisticsVO> getStatistics() {
        ArticleStatisticsVO statistics = articleQueryService.getStatistics();
        return Result.success(statistics);
    }

    /**
     * 保存文章（支持自动保存和手动保存）
     * 新建文章时返回完整数据（含新生成的ID）
     * 更新文章时返回更新后的时间戳和版本号
     */
    @PostMapping("/save")
    @ApiOperation(name = "保存文章", type = ApiOperationType.UPDATE,
            description = "保存文章，支持自动保存和手动保存，含版本控制")
    public Result<ArticleSaveResultVO> save(@Valid @RequestBody ArticleSaveDTO dto) {
        ArticleSaveResultVO result = articleSaveService.save(dto);
        return Result.success(result);
    }

    /**
     * 获取文章当前版本号
     */
    @GetMapping("/{id}/version")
    @ApiOperation(name = "获取文章版本", type = ApiOperationType.QUERY,
            description = "获取文章当前版本号，用于版本控制")
    public Result<Long> getVersion(@PathVariable Long id) {
        Long version = articleSaveService.getCurrentVersion(id);
        if (version == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(version);
    }

    /**
     * 检查文章是否存在版本冲突
     */
    @GetMapping("/{id}/conflict")
    @ApiOperation(name = "检查版本冲突", type = ApiOperationType.QUERY,
            description = "检查文章是否存在版本冲突")
    public Result<Boolean> checkConflict(
            @PathVariable Long id,
            @RequestParam Long clientVersion) {
        boolean hasConflict = articleSaveService.hasConflict(id, clientVersion);
        return Result.success(hasConflict);
    }

    // ==================== Markdown 导入相关接口 ====================

    /**
     * 预览 Markdown 导入（解析文件但不创建文章）
     */
    @PostMapping(value = "/import-md/preview")
    @ApiOperation(name = "预览 MD 导入", type = ApiOperationType.QUERY,
            description = "解析上传的 Markdown 文件，预览将要创建的文章和分类结构")
    public Result<MarkdownImportPreview> previewImport(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "basePath", defaultValue = "") String basePath) {
        try {
            MarkdownImportPreview preview = markdownImportService.previewImport(files, basePath);
            return Result.success(preview);
        } catch (Exception e) {
            return Result.error(500, "预览失败: " + e.getMessage());
        }
    }

    /**
     * 导入单个 Markdown 文件
     */
    @PostMapping(value = "/import-md")
    @ApiOperation(name = "导入单个 MD 文件", type = ApiOperationType.CREATE,
            description = "导入单个 Markdown 文件为文章")
    public Result<MarkdownImportResult> importMarkdown(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "importAssets", defaultValue = "true") Boolean importAssets,
            @RequestParam(value = "assetMode", defaultValue = "ABSOLUTE_URL") String assetMode,
            @RequestParam(value = "defaultStatus", defaultValue = "DRAFT") String defaultStatus) {
        try {
            MarkdownImportConfig config = new MarkdownImportConfig();
            config.setCategoryMode(MarkdownImportConfig.CategoryMode.MANUAL);
            config.setManualCategoryId(categoryId);
            config.setImportAssets(importAssets);
            config.setAssetMode(com.blog.modules.article.util.AssetPathProcessor.ProcessMode.valueOf(assetMode));
            config.setDefaultStatus(MarkdownImportConfig.ArticleStatus.valueOf(defaultStatus));

            MarkdownImportResult result = markdownImportService.importSingleFile(file, config);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(500, "导入失败: " + e.getMessage());
        }
    }

    /**
     * 批量导入 Markdown 文件
     */
    @PostMapping(value = "/import-md/batch", consumes = "multipart/form-data")
    @ApiOperation(name = "批量导入 MD 文件", type = ApiOperationType.CREATE,
            description = "批量导入多个 Markdown 文件，支持自动创建分类和层级结构")
    public Result<MarkdownImportResult> importMarkdownBatch(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "configJson", required = false) String configJson) {
        try {
            // 如果没有提供配置，使用默认配置
            MarkdownImportConfig config = new MarkdownImportConfig();
            if (configJson != null && !configJson.isEmpty()) {
                // TODO: 解析 JSON 配置
            }

            MarkdownImportResult result = markdownImportService.importBatch(files, config);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(500, "批量导入失败: " + e.getMessage());
        }
    }

    // ==================== Markdown 导出相关接口 ====================

    /**
     * 预览 Markdown 导出
     */
    @PostMapping("/export-md/preview")
    @ApiOperation(name = "预览 MD 导出", type = ApiOperationType.QUERY,
            description = "预览将要导出的文章和资源统计")
    public Result<MarkdownExportPreview> previewExport(@RequestBody MarkdownExportConfig config) {
        try {
            MarkdownExportPreview preview = markdownExportService.preview(config);
            return Result.success(preview);
        } catch (Exception e) {
            return Result.error(500, "预览失败: " + e.getMessage());
        }
    }

    /**
     * 执行 Markdown 导出
     */
    @PostMapping("/export-md")
    @ApiOperation(name = "导出 Markdown", type = ApiOperationType.CREATE,
            description = "导出网站的 Markdown 文档及资源，生成 ZIP 文件")
    public Result<MarkdownExportResult> exportMarkdown(@RequestBody MarkdownExportConfig config) {
        try {
            MarkdownExportResult result = markdownExportService.export(config);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(500, "导出失败: " + e.getMessage());
        }
    }

    /**
     * 下载导出文件
     */
    @GetMapping("/export-md/download/{taskId}")
    @ApiOperation(name = "下载导出文件", type = ApiOperationType.QUERY,
            description = "根据任务ID下载已生成的导出文件")
    public ResponseEntity<Resource> downloadExport(@PathVariable String taskId) {
        Resource file = markdownExportService.getExportFile(taskId);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        
        String filename = "blog-export-" + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + ".zip";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }
}


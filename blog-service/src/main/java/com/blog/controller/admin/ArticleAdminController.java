package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.ArticleDTO;
import com.blog.model.dto.ArticleSaveDTO;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.ArticleVO;
import com.blog.model.vo.ArticleStatisticsVO;
import com.blog.model.vo.ArticleSaveResultVO;
import com.blog.service.ArticleAdminCommandService;
import com.blog.service.ArticleAdminQueryService;
import com.blog.service.ArticleSaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/post")
@ApiOperation(value = "article", name = "文章管理模块", description = "文章的增删改查和发布管理", open = false)
public class ArticleAdminController {
    @Autowired
    private ArticleAdminQueryService articleAdminQueryService;

    @Autowired
    private ArticleAdminCommandService articleAdminCommandService;

    @Autowired
    private ArticleSaveService articleSaveService;

    @GetMapping("/list")
    @ApiOperation(value = "list", name = "查询文章列表", type = ApiOperationType.QUERY,
            description = "分页查询文章列表，支持按状态、分类、关键词筛选")
    public Result<PageResult<ArticleVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        PageResult<ArticleVO> result = articleAdminQueryService.list(page, size, status, categoryId, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "detail", name = "获取文章详情", type = ApiOperationType.QUERY,
            description = "根据ID查询单篇文章的详细信息")
    public Result<ArticleVO> getById(@PathVariable Long id) {
        ArticleVO vo = articleAdminQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(value = "create", name = "创建文章", type = ApiOperationType.CREATE,
            description = "创建新文章")
    public Result<Long> create(@Valid @RequestBody ArticleDTO dto) {
        Long id = articleAdminCommandService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "update", name = "更新文章", type = ApiOperationType.UPDATE,
            description = "更新已存在的文章内容")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ArticleDTO dto) {
        articleAdminCommandService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "delete", name = "删除文章", type = ApiOperationType.DELETE,
            description = "删除单篇文章")
    public Result<Void> delete(@PathVariable Long id) {
        articleAdminCommandService.delete(id);
        return Result.success();
    }

    @DeleteMapping("/batch")
    @ApiOperation(value = "deleteBatch", name = "批量删除文章", type = ApiOperationType.DELETE,
            description = "批量删除多篇文章")
    public Result<Void> deleteBatch(@RequestBody List<Long> ids) {
        articleAdminCommandService.deleteBatch(ids);
        return Result.success();
    }

    @PostMapping("/{id}/publish")
    @ApiOperation(value = "publish", name = "发布文章", type = ApiOperationType.CREATE,
            description = "发布文章使其在前台可见")
    public Result<Void> publish(@PathVariable Long id) {
        articleAdminCommandService.publish(id);
        return Result.success();
    }

    @PostMapping("/{id}/unpublish")
    @ApiOperation(value = "unpublish", name = "取消发布", type = ApiOperationType.CREATE,
            description = "取消文章发布，使其变为草稿状态")
    public Result<Void> unpublish(@PathVariable Long id) {
        articleAdminCommandService.unpublish(id);
        return Result.success();
    }

    @GetMapping("/statistics")
    @ApiOperation(value = "statistics", name = "文章统计", type = ApiOperationType.QUERY,
            description = "获取文章相关统计数据")
    public Result<ArticleStatisticsVO> getStatistics() {
        ArticleStatisticsVO statistics = articleAdminQueryService.getStatistics();
        return Result.success(statistics);
    }

    /**
     * 保存文章（支持自动保存和手动保存）
     * 新建文章时返回完整数据（含新生成的ID）
     * 更新文章时返回更新后的时间戳和版本号
     */
    @PostMapping("/save")
    @ApiOperation(value = "save", name = "保存文章", type = ApiOperationType.UPDATE,
            description = "保存文章，支持自动保存和手动保存，含版本控制")
    public Result<ArticleSaveResultVO> save(@Valid @RequestBody ArticleSaveDTO dto) {
        ArticleSaveResultVO result = articleSaveService.save(dto);
        return Result.success(result);
    }

    /**
     * 获取文章当前版本号
     */
    @GetMapping("/{id}/version")
    @ApiOperation(value = "getVersion", name = "获取文章版本", type = ApiOperationType.QUERY,
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
    @ApiOperation(value = "checkConflict", name = "检查版本冲突", type = ApiOperationType.QUERY,
            description = "检查文章是否存在版本冲突")
    public Result<Boolean> checkConflict(
            @PathVariable Long id,
            @RequestParam Long clientVersion) {
        boolean hasConflict = articleSaveService.hasConflict(id, clientVersion);
        return Result.success(hasConflict);
    }
}


package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.ArticleDTO;
import com.blog.model.vo.ArticleVO;
import com.blog.model.vo.ArticleStatisticsVO;
import com.blog.service.ArticleAdminCommandService;
import com.blog.service.ArticleAdminQueryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/post")
@ApiResource(name = "文章管理接口")
public class ArticleAdminController {
    @Autowired
    private ArticleAdminQueryService articleAdminQueryService;

    @Autowired
    private ArticleAdminCommandService articleAdminCommandService;

    @GetMapping("/list")
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
    public Result<ArticleVO> getById(@PathVariable Long id) {
        ArticleVO vo = articleAdminQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "文章不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody ArticleDTO dto) {
        Long id = articleAdminCommandService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ArticleDTO dto) {
        articleAdminCommandService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        articleAdminCommandService.delete(id);
        return Result.success();
    }

    @DeleteMapping("/batch")
    public Result<Void> deleteBatch(@RequestBody List<Long> ids) {
        articleAdminCommandService.deleteBatch(ids);
        return Result.success();
    }

    @PostMapping("/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        articleAdminCommandService.publish(id);
        return Result.success();
    }

    @PostMapping("/{id}/unpublish")
    public Result<Void> unpublish(@PathVariable Long id) {
        articleAdminCommandService.unpublish(id);
        return Result.success();
    }

    @GetMapping("/statistics")
    public Result<ArticleStatisticsVO> getStatistics() {
        ArticleStatisticsVO statistics = articleAdminQueryService.getStatistics();
        return Result.success(statistics);
    }
}


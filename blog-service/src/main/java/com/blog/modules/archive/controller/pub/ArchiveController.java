package com.blog.modules.archive.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.archive.service.ArchiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/public/archive")
@ApiOperation(name = "归档公开接口", description = "文章归档相关接口", open = true)
public class ArchiveController {
    @Autowired
    private ArchiveService archiveService;

    @GetMapping("/list")
    @ApiOperation(name = "获取归档列表", type = ApiOperationType.QUERY, description = "获取文章归档时间线列表")
    public Result<List<ArchiveVO>> list() {
        List<ArchiveVO> archives = archiveService.list();
        return Result.success(archives);
    }

    @GetMapping("/{year}/{month}")
    @ApiOperation(name = "获取归档文章列表", type = ApiOperationType.QUERY, description = "根据年份和月份获取文章列表")
    public Result<PageResult<ArticleVO>> getArticlesByYearAndMonth(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<ArticleVO> result = archiveService.getArticlesByYearAndMonth(year, month, page, size);
        return Result.success(result);
    }
}


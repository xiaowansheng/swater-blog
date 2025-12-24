package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.ArchiveVO;
import com.blog.model.vo.ArticleVO;
import com.blog.service.ArchiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/archive")
@ApiResource(name = "归档公开接口", isOpen = true)
public class ArchiveController {
    @Autowired
    private ArchiveService archiveService;

    @GetMapping("/list")
    public Result<List<ArchiveVO>> list() {
        List<ArchiveVO> archives = archiveService.list();
        return Result.success(archives);
    }

    @GetMapping("/{year}/{month}")
    public Result<PageResult<ArticleVO>> getArticlesByYearAndMonth(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<ArticleVO> result = archiveService.getArticlesByYearAndMonth(year, month, page, size);
        return Result.success(result);
    }
}


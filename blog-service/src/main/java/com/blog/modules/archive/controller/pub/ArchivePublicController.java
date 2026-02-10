package com.blog.modules.archive.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.archive.service.ArchivePublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/public/archive")
@ApiOperation(name = "归档公开接口", description = "文章归档相关接口", open = true)
public class ArchivePublicController {
    @Autowired
    private ArchivePublicService archivePublicService;

    @GetMapping("/list")
    @ApiOperation(name = "获取归档文章列表", type = ApiOperationType.QUERY, description = "获取归档页文章列表，按创建时间倒序排列")
    public Result<PageResult<ArticleVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        PageResult<ArticleVO> result = archivePublicService.list(page, size);
        return Result.success(result);
    }
}

package com.blog.modules.archive.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.archive.service.ArchiveAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/archive")
@ApiOperation(name = "归档管理模块", description = "归档管理接口", open = false)
public class ArchiveAdminController {
    @Autowired
    private ArchiveAdminService archiveAdminService;

    @GetMapping("/list")
    @ApiOperation(name = "查询归档列表", type = ApiOperationType.QUERY, description = "查询所有文章归档统计（包括已发布、草稿、私密）")
    public Result<List<ArchiveVO>> list() {
        List<ArchiveVO> archives = archiveAdminService.listAll();
        return Result.success(archives);
    }

    @GetMapping("/articles")
    @ApiOperation(name = "按年月查询文章列表", type = ApiOperationType.QUERY, description = "管理端归档视图：按年月分页查询该月全部状态的文章")
    public Result<PageResult<ArticleVO>> listArticlesByMonth(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size) {
        return Result.success(archiveAdminService.listArticlesByMonth(year, month, page, size));
    }
}

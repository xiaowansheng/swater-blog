package com.blog.modules.archive.controller.admin;


import com.blog.common.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.archive.service.ArchiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/archive")
@ApiOperation(name = "归档管理模块", description = "归档管理接口", open = false)
public class ArchiveAdminController {
    @Autowired
    private ArchiveService archiveService;

    @GetMapping("/list")
    @ApiOperation(name = "查询归档列表", type = ApiOperationType.QUERY, description = "查询所有归档")
    public Result<List<ArchiveVO>> list() {
        List<ArchiveVO> archives = archiveService.list();
        return Result.success(archives);
    }

    @PostMapping("/regenerate")
    @ApiOperation(name = "重新生成归档", type = ApiOperationType.OTHER, description = "重新生成文章归档")
    public Result<Void> regenerate() {
        archiveService.regenerate();
        return Result.success();
    }
}

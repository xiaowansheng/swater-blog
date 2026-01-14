package com.blog.modules.archive.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.archive.service.ArchiveAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/admin/archive")
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
}

package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.ArchiveVO;
import com.blog.service.ArchiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/archive")
@ApiResource(name = "归档管理接口")
public class ArchiveAdminController {
    @Autowired
    private ArchiveService archiveService;

    @GetMapping("/list")
    public Result<List<ArchiveVO>> list() {
        List<ArchiveVO> archives = archiveService.list();
        return Result.success(archives);
    }

    @PostMapping("/regenerate")
    public Result<Void> regenerate() {
        archiveService.regenerate();
        return Result.success();
    }
}


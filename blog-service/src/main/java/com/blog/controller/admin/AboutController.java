package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.model.dto.AboutDTO;
import com.blog.model.vo.AboutVO;
import com.blog.service.AboutService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/about")
@ApiOperation(value = "about", name = "关于管理模块", description = "关于页面管理接口", open = false)
public class AboutController {
    @Autowired
    private AboutService aboutService;

    @GetMapping
    @ApiOperation(value = "detail", name = "获取关于信息", type = ApiOperationType.QUERY, description = "获取关于页面信息")
    public Result<AboutVO> getAbout() {
        AboutVO vo = aboutService.getAbout();
        return Result.success(vo);
    }

    @PutMapping
    @ApiOperation(value = "update", name = "更新关于信息", type = ApiOperationType.UPDATE, description = "更新关于页面信息")
    public Result<Void> updateAbout(@Valid @RequestBody AboutDTO dto) {
        aboutService.updateAbout(dto);
        return Result.success();
    }
}


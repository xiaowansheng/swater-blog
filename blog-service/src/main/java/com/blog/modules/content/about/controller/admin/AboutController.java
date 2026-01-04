package com.blog.modules.content.about.controller.admin;


import com.blog.common.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.modules.content.about.model.dto.AboutDTO;
import com.blog.modules.content.about.model.vo.AboutVO;
import com.blog.modules.content.about.service.AboutService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/about")
@ApiOperation(name = "关于管理模块", description = "关于页面管理接口", open = false)
public class AboutController {
    @Autowired
    private AboutService aboutService;

    @GetMapping
    @ApiOperation(name = "获取关于信息", type = ApiOperationType.QUERY, description = "获取关于页面信息")
    public Result<AboutVO> getAbout() {
        AboutVO vo = aboutService.getAbout();
        return Result.success(vo);
    }

    @PutMapping
    @ApiOperation(name = "更新关于信息", type = ApiOperationType.UPDATE, description = "更新关于页面信息")
    public Result<Void> updateAbout(@Valid @RequestBody AboutDTO dto) {
        aboutService.updateAbout(dto);
        return Result.success();
    }
}


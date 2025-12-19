package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.AboutDTO;
import com.blog.model.vo.AboutVO;
import com.blog.service.AboutService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/about")
@ApiResource(name = "关于管理接口")
public class AboutController {
    @Autowired
    private AboutService aboutService;

    @GetMapping
    public Result<AboutVO> getAbout() {
        AboutVO vo = aboutService.getAbout();
        return Result.success(vo);
    }

    @PutMapping
    public Result<Void> updateAbout(@Valid @RequestBody AboutDTO dto) {
        aboutService.updateAbout(dto);
        return Result.success();
    }
}


package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.AboutVO;
import com.blog.service.AboutPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/about")
@ApiOperation(value = "pub:about", name = "关于公开接口", description = "关于页面相关接口", open = true)
public class AboutPublicController {
    @Autowired
    private AboutPublicService aboutPublicService;

    @GetMapping
    @ApiOperation(value = "query", name = "获取关于页面信息", type = ApiOperationType.QUERY, description = "获取关于页面的详细信息")
    public Result<AboutVO> getAbout() {
        AboutVO vo = aboutPublicService.getAbout();
        return Result.success(vo);
    }
}


package com.blog.modules.content.about.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.content.about.model.vo.AboutVO;
import com.blog.modules.content.about.service.AboutPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/public/about")
@ApiOperation(name = "关于公开接口", description = "关于页面相关接口", open = true)
public class AboutPublicController {
    @Autowired
    private AboutPublicService aboutPublicService;

    @GetMapping
    @ApiOperation(name = "获取关于页面信息", type = ApiOperationType.QUERY, description = "获取关于页面的详细信息")
    public Result<AboutVO> getAbout() {
        AboutVO vo = aboutPublicService.getAbout();
        return Result.success(vo);
    }
}


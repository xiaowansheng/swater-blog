package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.AboutVO;
import com.blog.service.AboutPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/about")
@ApiResource(name = "关于公开接口", isOpen = true)
public class AboutPublicController {
    @Autowired
    private AboutPublicService aboutPublicService;

    @GetMapping
    public Result<AboutVO> getAbout() {
        AboutVO vo = aboutPublicService.getAbout();
        return Result.success(vo);
    }
}


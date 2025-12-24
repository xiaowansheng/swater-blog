package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.MenuVO;
import com.blog.service.MenuPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/menu")
@ApiResource(name = "菜单公开接口", isOpen = true)
public class MenuPublicController {
    @Autowired
    private MenuPublicService menuPublicService;

    @GetMapping("/current")
    public Result<List<MenuVO>> getCurrentUserMenus() {
        List<MenuVO> menus = menuPublicService.getCurrentUserMenus();
        return Result.success(menus);
    }
}


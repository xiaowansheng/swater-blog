package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.MenuVO;
import com.blog.service.MenuPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/menu")
@ApiOperation(value = "pub:menu", name = "菜单公开接口", description = "菜单相关接口", open = true)
public class MenuPublicController {
    @Autowired
    private MenuPublicService menuPublicService;

    @GetMapping("/current")
    @ApiOperation(value = "query", name = "获取当前用户菜单", type = ApiOperationType.QUERY, description = "获取当前用户的菜单列表")
    public Result<List<MenuVO>> getCurrentUserMenus() {
        List<MenuVO> menus = menuPublicService.getCurrentUserMenus();
        return Result.success(menus);
    }
}


package com.blog.modules.system.menu.controller.pub;



import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.system.menu.model.vo.MenuVO;
import com.blog.modules.system.menu.service.MenuPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
@RestController
@RequestMapping("/public/menu")
@ApiOperation(name = "菜单公开接口", description = "菜单相关接口", open = true)
public class MenuPublicController {
    @Autowired
    private MenuPublicService menuPublicService;

    @GetMapping("/current")
    @ApiOperation(name = "获取当前用户菜单", type = ApiOperationType.QUERY, description = "获取当前用户的菜单列表")
    public Result<List<MenuVO>> getCurrentUserMenus() {
        List<MenuVO> menus = menuPublicService.getCurrentUserMenus();
        return Result.success(menus);
    }
}


package com.blog.modules.system.menu.controller.admin;



import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.modules.system.menu.model.dto.MenuDTO;
import com.blog.modules.system.menu.model.vo.MenuVO;
import com.blog.modules.system.menu.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/admin/menu")
@ApiOperation(name = "菜单管理模块", description = "菜单管理接口", open = false)
public class MenuController {
    @Autowired
    private MenuService menuService;

    @GetMapping("/list")
    @ApiOperation(name = "查询菜单列表", type = ApiOperationType.QUERY, description = "查询所有菜单")
    public Result<List<MenuVO>> list() {
        List<MenuVO> list = menuService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取菜单详情", type = ApiOperationType.QUERY, description = "根据ID获取菜单详情")
    public Result<MenuVO> getById(@PathVariable Long id) {
        MenuVO vo = menuService.getById(id);
        if (vo == null) {
            return Result.error(404, "菜单不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建菜单", type = ApiOperationType.CREATE, description = "创建新菜单")
    public Result<Long> create(@Valid @RequestBody MenuDTO dto) {
        Long id = menuService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新菜单", type = ApiOperationType.UPDATE, description = "更新菜单信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody MenuDTO dto) {
        menuService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除菜单", type = ApiOperationType.DELETE, description = "删除菜单")
    public Result<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return Result.success();
    }

    @PostMapping("/role/{roleId}/menus")
    @ApiOperation(name = "分配菜单", type = ApiOperationType.UPDATE, description = "为角色分配菜单")
    public Result<Void> assignMenus(@PathVariable Long roleId, @RequestBody List<Long> menuIds) {
        menuService.assignMenus(roleId, menuIds);
        return Result.success();
    }
}


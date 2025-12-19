package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.MenuDTO;
import com.blog.model.vo.MenuVO;
import com.blog.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/menu")
@ApiResource(name = "菜单管理接口")
public class MenuController {
    @Autowired
    private MenuService menuService;

    @GetMapping("/list")
    public Result<List<MenuVO>> list() {
        List<MenuVO> list = menuService.list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<MenuVO> getById(@PathVariable Long id) {
        MenuVO vo = menuService.getById(id);
        if (vo == null) {
            return Result.error(404, "菜单不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody MenuDTO dto) {
        Long id = menuService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody MenuDTO dto) {
        menuService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return Result.success();
    }

    @PostMapping("/role/{roleId}/menus")
    public Result<Void> assignMenus(@PathVariable Long roleId, @RequestBody List<Long> menuIds) {
        menuService.assignMenus(roleId, menuIds);
        return Result.success();
    }
}


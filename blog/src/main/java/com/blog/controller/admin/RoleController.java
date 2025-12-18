package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.RoleDTO;
import com.blog.model.vo.RoleVO;
import com.blog.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/role")
@ApiResource(name = "角色管理接口")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping("/list")
    public Result<List<RoleVO>> list() {
        List<RoleVO> roles = roleService.list();
        return Result.success(roles);
    }

    @GetMapping("/{id}")
    public Result<RoleVO> getById(@PathVariable Long id) {
        RoleVO vo = roleService.getById(id);
        if (vo == null) {
            return Result.error(404, "角色不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody RoleDTO dto) {
        Long id = roleService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody RoleDTO dto) {
        roleService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/apis")
    public Result<Void> assignApis(@PathVariable Long id, @RequestBody List<Long> apiIds) {
        roleService.assignApis(id, apiIds);
        return Result.success();
    }
}


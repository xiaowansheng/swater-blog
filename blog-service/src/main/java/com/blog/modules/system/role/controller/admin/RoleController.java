package com.blog.modules.system.role.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.modules.system.role.model.dto.RoleDTO;
import com.blog.modules.system.role.model.vo.RoleVO;
import com.blog.modules.system.role.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/admin/role")
@ApiOperation(name = "角色管理模块", description = "角色管理接口", open = false)
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping("/list")
    @ApiOperation(name = "查询角色列表", type = ApiOperationType.QUERY, description = "查询所有角色")
    public Result<List<RoleVO>> list() {
        List<RoleVO> roles = roleService.list();
        return Result.success(roles);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取角色详情", type = ApiOperationType.QUERY, description = "根据ID获取角色详情")
    public Result<RoleVO> getById(@PathVariable Long id) {
        RoleVO vo = roleService.getById(id);
        if (vo == null) {
            return Result.error(404, "角色不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建角色", type = ApiOperationType.CREATE, description = "创建新角色")
    public Result<Long> create(@Valid @RequestBody RoleDTO dto) {
        Long id = roleService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新角色", type = ApiOperationType.UPDATE, description = "更新角色信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody RoleDTO dto) {
        roleService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除角色", type = ApiOperationType.DELETE, description = "删除角色")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/apis")
    @ApiOperation(name = "分配接口权限", type = ApiOperationType.UPDATE, description = "为角色分配接口权限")
    public Result<Void> assignApis(@PathVariable Long id, @RequestBody List<Long> apiIds) {
        roleService.assignApis(id, apiIds);
        return Result.success();
    }
}


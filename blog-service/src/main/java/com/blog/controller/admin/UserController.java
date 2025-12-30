package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.ResetPasswordDTO;
import com.blog.model.dto.UserDTO;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.UserVO;
import com.blog.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/user")
@ApiOperation(value = "user", name = "用户管理模块", description = "用户的增删改查和权限管理", open = false)
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/list")
    @ApiOperation(value = "list", name = "查询用户列表", type = ApiOperationType.QUERY,
            description = "分页查询用户列表，支持按关键词搜索")
    public Result<PageResult<UserVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String keyword) {
        PageResult<UserVO> result = userService.list(page, size, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "detail", name = "获取用户详情", type = ApiOperationType.QUERY,
            description = "根据ID查询单个用户的详细信息")
    public Result<UserVO> getById(@PathVariable Long id) {
        UserVO vo = userService.getById(id);
        if (vo == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(value = "create", name = "创建用户", type = ApiOperationType.CREATE,
            description = "创建新用户")
    public Result<Long> create(@Valid @RequestBody UserDTO dto) {
        Long id = userService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "update", name = "更新用户", type = ApiOperationType.UPDATE,
            description = "更新用户信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody UserDTO dto) {
        userService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "delete", name = "删除用户", type = ApiOperationType.DELETE,
            description = "删除指定用户")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/reset-password")
    @ApiOperation(value = "resetPassword", name = "重置密码", type = ApiOperationType.UPDATE,
            description = "重置用户密码")
    public Result<Void> resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordDTO dto) {
        userService.resetPassword(id, dto);
        return Result.success();
    }

    @PostMapping("/{id}/roles")
    @ApiOperation(value = "assignRoles", name = "分配角色", type = ApiOperationType.UPDATE,
            description = "为用户分配角色")
    public Result<Void> assignRoles(@PathVariable Long id, @RequestBody List<Long> roleIds) {
        userService.assignRoles(id, roleIds);
        return Result.success();
    }
}


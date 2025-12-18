package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.LoginLogQueryDTO;
import com.blog.model.vo.LoginLogVO;
import com.blog.service.LoginLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/login-log")
@ApiResource(name = "登录日志管理接口")
public class LoginLogController {
    @Autowired
    private LoginLogService loginLogService;

    @GetMapping("/list")
    public Result<PageResult<LoginLogVO>> list(LoginLogQueryDTO queryDTO) {
        PageResult<LoginLogVO> result = loginLogService.list(queryDTO);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<LoginLogVO> getById(@PathVariable Long id) {
        LoginLogVO vo = loginLogService.getById(id);
        if (vo == null) {
            return Result.error(404, "登录日志不存在");
        }
        return Result.success(vo);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        loginLogService.delete(id);
        return Result.success();
    }
}


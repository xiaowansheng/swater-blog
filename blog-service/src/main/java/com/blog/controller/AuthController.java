package com.blog.controller;

import com.blog.annotation.ApiResource;
import com.blog.annotation.RateLimit;
import com.blog.common.Result;
import com.blog.model.dto.LoginDTO;
import com.blog.model.vo.LoginVO;
import com.blog.model.vo.UserVO;
import com.blog.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@ApiResource(name = "认证接口", isOpen = true)
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 300,  // 5分钟窗口
        limit = 5,     // 最多5次登录尝试
        message = "登录尝试过于频繁，请5分钟后再试"
    )
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        LoginVO loginVO = authService.login(dto);
        return Result.success(loginVO);
    }

    @PostMapping("/logout")
    @RateLimit(
        dimension = RateLimit.Dimension.USER,
        window = 60,
        limit = 10
    )
    public Result<Void> logout() {
        authService.logout();
        return Result.success();
    }

    @GetMapping("/current")
    public Result<UserVO> getCurrentUser() {
        UserVO user = authService.getCurrentUser();
        return Result.success(user);
    }

    @PostMapping("/refresh")
    public Result<String> refreshToken() {
        String token = authService.refreshToken();
        return Result.success(token);
    }
}


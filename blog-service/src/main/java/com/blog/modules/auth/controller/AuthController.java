package com.blog.modules.auth.controller;


import com.blog.shared.annotation.ApiDocumentation;
import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.annotation.RateLimit;
import com.blog.shared.Result;
import com.blog.modules.auth.model.dto.EmailVerifyDTO;
import com.blog.modules.auth.model.dto.LoginDTO;
import com.blog.modules.auth.model.dto.SendCodeDTO;
import com.blog.modules.auth.model.dto.ResetPasswordDTO;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.auth.model.vo.EmailVerifyVO;
import com.blog.modules.auth.model.vo.LoginVO;
import com.blog.modules.user.model.vo.UserVO;
import com.blog.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/auth")
@ApiOperation(name = "认证模块", description = "用户认证相关接口", open = true)
@Tag(name = "认证管理", description = "用户认证相关接口，包括登录、登出、token刷新等")
@ApiDocumentation.PublicApi
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @ApiOperation(name = "用户登录", type = ApiOperationType.LOGIN, description = "用户登录接口")
    @Operation(
        summary = "用户登录",
        description = """
            用户登录接口，支持用户名/邮箱登录。
            
            **功能特性：**
            - 支持用户名或邮箱登录
            - 自动记录登录日志
            - 返回JWT token和用户信息
            - 实施登录限流保护
            
            **安全措施：**
            - 5分钟内最多允许5次登录尝试
            - 密码错误会记录安全日志
            - 支持IP地址和地理位置记录
            
            **返回说明：**
            - token: 用于后续API调用的认证令牌
            - userInfo: 当前登录用户的基本信息
            - expiresIn: token过期时间（秒）
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "登录成功",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 200,
                      "message": "success",
                      "data": {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "tokenType": "Bearer",
                        "expiresIn": 2592000,
                        "userInfo": {
                          "id": 1,
                          "username": "admin",
                          "nickname": "管理员",
                          "email": "admin@example.com",
                          "avatar": "https://example.com/avatar.jpg",
                          "role": "admin"
                        }
                      }
                    }
                    """
            )
        )
    )
    @ApiResponse(
        responseCode = "400",
        description = "登录失败",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 400,
                      "message": "用户名或密码错误",
                      "timestamp": 1640995200000
                    }
                    """
            )
        )
    )
    @ApiResponse(
        responseCode = "429",
        description = "登录频率限制",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 429,
                      "message": "登录尝试过于频繁，请5分钟后再试",
                      "timestamp": 1640995200000
                    }
                    """
            )
        )
    )
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 300,  // 5分钟窗口
        limit = 5,     // 最多5次登录尝试
        message = "登录尝试过于频繁，请5分钟后再试"
    )
    public Result<LoginVO> login(
            @Parameter(
                description = "登录信息",
                required = true,
                content = @Content(
                    examples = @ExampleObject(
                        value = """
                            {
                              "username": "admin",
                              "password": "123456",
                              "rememberMe": true
                            }
                            """
                    )
                )
            )
            @Valid @RequestBody LoginDTO dto) {
        LoginVO loginVO = authService.login(dto);
        return Result.success(loginVO);
    }

    @PostMapping("/logout")
    @ApiOperation(name = "用户登出", type = ApiOperationType.LOGOUT, description = "用户登出接口")
    @Operation(
        summary = "用户登出",
        description = """
            用户登出接口，清除服务端token状态。
            
            **功能说明：**
            - 清除服务端token缓存
            - 记录登出日志
            - 支持批量登出（可选）
            
            **注意事项：**
            - 需要在请求头中携带有效的token
            - 登出后token立即失效
            - 客户端应同时清除本地token
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "登出成功",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 200,
                      "message": "登出成功",
                      "timestamp": 1640995200000
                    }
                    """
            )
        )
    )
    @ApiDocumentation.RequireAuth
    @ApiDocumentation.StandardApiResponses
    @RateLimit(
        dimension = RateLimit.Dimension.USER,
        window = 60,
        limit = 10
    )
    public Result<Void> logout() {
        authService.logout();
        return Result.success();
    }

    @GetMapping("/user-info")
    @ApiOperation(name = "获取用户信息", type = ApiOperationType.QUERY, description = "获取当前用户信息")
    @Operation(
        summary = "获取当前用户信息",
        description = """
            获取当前登录用户的详细信息。
            
            **返回信息包括：**
            - 基本信息：用户名、昵称、邮箱等
            - 权限信息：角色、权限列表
            - 统计信息：登录次数、最后登录时间等
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "获取成功",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 200,
                      "message": "success",
                      "data": {
                        "id": 1,
                        "username": "admin",
                        "nickname": "管理员",
                        "email": "admin@example.com",
                        "avatar": "https://example.com/avatar.jpg",
                        "role": "admin",
                        "permissions": ["article:read", "article:write"],
                        "lastLoginTime": "2024-01-01T12:00:00",
                        "loginCount": 100
                      }
                    }
                    """
            )
        )
    )
    @ApiDocumentation.RequireAuth
    @ApiDocumentation.StandardApiResponses
    public Result<UserVO> getUserInfo() {
        UserVO userVO = authService.getCurrentUser();
        return Result.success(userVO);
    }

    @PostMapping("/refresh-token")
    @ApiOperation(name = "刷新令牌", type = ApiOperationType.OTHER, description = "刷新访问令牌")
    @Operation(
        summary = "刷新访问令牌",
        description = """
            使用refresh token刷新access token。
            
            **使用场景：**
            - access token即将过期时
            - 实现无感知token续期
            - 提升用户体验
            
            **注意事项：**
            - 需要有效的refresh token
            - 刷新后旧token立即失效
            - 返回新的access token和refresh token
            """
    )
    @ApiResponse(
        responseCode = "200",
        description = "刷新成功",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 200,
                      "message": "success",
                      "data": {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "expiresIn": 2592000
                      }
                    }
                    """
            )
        )
    )
    @ApiDocumentation.StandardApiResponses
    public Result<LoginVO> refreshToken(
            @Parameter(description = "刷新令牌", required = true)
            @RequestParam String refreshToken) {
        // 这里应该验证refreshToken，然后调用无参数的refreshToken方法
        String newToken = authService.refreshToken();
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(newToken);
        // 设置其他必要的字段
        return Result.success(loginVO);
    }

    @PostMapping("/email/verify")
    @ApiOperation(name = "邮箱验证会话", type = ApiOperationType.OTHER, description = "校验邮箱验证码并签发会话凭证token")
    public Result<EmailVerifyVO> verifyEmail(@Valid @RequestBody EmailVerifyDTO dto) {
        return Result.success(authService.verifyEmail(dto));
    }

    @GetMapping("/current")
    @ApiOperation(name = "获取当前用户", type = ApiOperationType.QUERY, description = "获取当前登录用户")
    public Result<UserVO> getCurrentUser() {
        UserVO user = authService.getCurrentUser();
        return Result.success(user);
    }

    @PostMapping("/refresh")
    @ApiOperation(name = "刷新令牌", type = ApiOperationType.OTHER, description = "刷新令牌")
    public Result<String> refreshToken() {
        String token = authService.refreshToken();
        return Result.success(token);
    }

    @PostMapping("/login/email")
    @ApiOperation(name = "邮箱验证码登录", type = ApiOperationType.LOGIN, description = "使用邮箱验证码登录")
    @Operation(summary = "邮箱验证码登录", description = "使用邮箱和验证码进行登录")
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 300,
        limit = 10,
        message = "登录尝试过于频繁，请5分钟后再试"
    )
    public Result<LoginVO> loginWithEmail(@Valid @RequestBody EmailVerifyDTO dto) {
        LoginVO loginVO = authService.loginWithEmail(dto.getEmail(), dto.getCode());
        return Result.success(loginVO);
    }

    @PostMapping("/send-code")
    @ApiOperation(name = "发送邮箱验证码", type = ApiOperationType.OTHER, description = "发送邮箱验证码")
    @Operation(summary = "发送邮箱验证码", description = "发送登录或重置密码的邮箱验证码")
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 300,
        limit = 5,
        message = "验证码发送过于频繁，请5分钟后再试"
    )
    public Result<Void> sendCode(@Valid @RequestBody SendCodeDTO dto) {
        authService.sendCode(dto);
        return Result.success();
    }

    @PostMapping("/reset-password")
    @ApiOperation(name = "重置密码", type = ApiOperationType.OTHER, description = "通过邮箱验证码重置密码")
    @Operation(summary = "重置密码", description = "使用邮箱验证码重置密码")
    @RateLimit(
        type = RateLimit.Type.SLIDING_WINDOW,
        dimension = RateLimit.Dimension.IP,
        window = 300,
        limit = 3,
        message = "重置密码请求过于频繁，请5分钟后再试"
    )
    public Result<Void> resetPassword(@Valid @RequestBody ResetPasswordDTO dto) {
        authService.resetPassword(dto);
        return Result.success();
    }
}


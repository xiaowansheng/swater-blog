package com.blog.modules.auth.model.dto;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;
@Data
public class LoginDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;

    private String password;

    /**
     * 前端 RSA 加密后的密码（Base64）
     */
    private String encryptedPassword;

    /**
     * 登录随机数，用于防重放
     */
    private String nonce;
}


package com.blog.modules.auth.model.vo;

import lombok.Data;

@Data
public class EmailVerifyVO {
    private String token;
    private Long expiresIn;
    private String email;
}


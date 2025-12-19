package com.blog.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ResetPasswordDTO {
    @NotBlank(message = "新密码不能为空")
    private String password;
}


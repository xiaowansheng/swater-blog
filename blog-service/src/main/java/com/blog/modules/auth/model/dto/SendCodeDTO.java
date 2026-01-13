package com.blog.modules.auth.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendCodeDTO {
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "验证码类型不能为空")
    @Pattern(regexp = "login|reset", message = "验证码类型只能是 login 或 reset")
    private String type;
}

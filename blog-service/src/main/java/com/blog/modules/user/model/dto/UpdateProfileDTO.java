package com.blog.modules.user.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileDTO {

    @NotBlank(message = "昵称不能为空")
    @Size(max = 50, message = "昵称长度不能超过50")
    private String nickname;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String avatar;

    @Size(max = 20, message = "手机号长度不能超过20")
    private String phone;

    @Size(max = 20, message = "QQ号长度不能超过20")
    private String qq;

    @Size(max = 200, message = "个性签名长度不能超过200")
    private String signature;

    @Size(max = 200, message = "个人网站长度不能超过200")
    private String website;

    @Size(max = 500, message = "个人简介长度不能超过500")
    private String introduction;
}

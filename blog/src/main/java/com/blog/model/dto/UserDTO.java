package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserDTO extends BaseDTO {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String password;

    @NotBlank(message = "昵称不能为空")
    private String nickname;

    private String avatar;

    private String phone;

    private String qq;

    private String signature;

    private String website;

    private String introduction;

    private String role;

    private Integer status;

    private Integer disabled;

    private List<Long> roleIds;
}


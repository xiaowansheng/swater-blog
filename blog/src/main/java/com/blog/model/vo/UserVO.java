package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserVO extends BaseVO {
    private String username;

    private String email;

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

    private LocalDateTime lastLoginTime;

    private String lastLoginIp;

    private List<RoleVO> roles;
}


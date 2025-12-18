package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user")
public class User extends BaseEntity {
    private String username;

    private String email;

    private String password;

    private String salt;

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

    @TableField("last_login_time")
    private LocalDateTime lastLoginTime;

    @TableField("last_login_ip")
    private String lastLoginIp;

    @TableField("ip_address_signup")
    private String ipAddressSignup;

    @TableField("ip_source_signup")
    private String ipSourceSignup;
}


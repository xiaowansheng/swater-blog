package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("role_api")
public class RoleApi {
    @TableField("role_id")
    private Long roleId;

    @TableField("api_id")
    private Long apiId;

    @TableField("create_time")
    private LocalDateTime createTime;
}


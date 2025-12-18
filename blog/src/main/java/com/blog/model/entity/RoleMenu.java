package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("role_menu")
public class RoleMenu {
    @TableField("role_id")
    private Long roleId;

    @TableField("menu_id")
    private Long menuId;

    @TableField("create_time")
    private LocalDateTime createTime;
}


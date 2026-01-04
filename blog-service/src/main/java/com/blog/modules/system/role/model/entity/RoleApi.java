package com.blog.modules.system.role.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.blog.common.model.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色API关联实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("role_api")
public class RoleApi extends BaseEntity {
    @TableField("role_id")
    private Long roleId;
    
    @TableField("api_id")
    private Long apiId;
    
    // Manual setter methods (Lombok backup)
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public void setApiId(Long apiId) { this.apiId = apiId; }
    
    // Manual getter methods (Lombok backup)
    public Long getRoleId() { return roleId; }
    public Long getApiId() { return apiId; }
}

package com.blog.modules.system.role.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.FieldFill;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 角色API关联实体
 */
@Data
@TableName("role_api")
public class RoleApi {
    @TableField("role_id")
    private Long roleId;
    
    @TableField("api_id")
    private Long apiId;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    // Manual setter methods (Lombok backup)
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public void setApiId(Long apiId) { this.apiId = apiId; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    
    // Manual getter methods (Lombok backup)
    public Long getRoleId() { return roleId; }
    public Long getApiId() { return apiId; }
    public LocalDateTime getCreateTime() { return createTime; }
}

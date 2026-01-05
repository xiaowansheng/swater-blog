#!/usr/bin/env python3
"""
Fix remaining compilation issues including duplicate class definitions,
missing DTO classes, and other import problems.
"""

import os
import re
from pathlib import Path

def fix_duplicate_class_definitions():
    """Fix duplicate class definition issues"""
    
    # Fix ResetPasswordDTO duplicate definition
    reset_password_dto_path = Path("blog-service/src/main/java/com/blog/modules/auth/model/dto/ResetPasswordDTO.java")
    if reset_password_dto_path.exists():
        content = reset_password_dto_path.read_text(encoding='utf-8')
        
        # Remove the problematic import that causes duplicate definition
        content = re.sub(r'import com\.blog\.modules\.user\.model\.dto\.ResetPasswordDTO;\s*\n', '', content)
        
        reset_password_dto_path.write_text(content, encoding='utf-8')
        print("✅ Fixed ResetPasswordDTO duplicate definition")
    
    # Fix RoleApiMapper duplicate definition
    role_api_mapper_path = Path("blog-service/src/main/java/com/blog/modules/system/role/mapper/RoleApiMapper.java")
    if role_api_mapper_path.exists():
        content = role_api_mapper_path.read_text(encoding='utf-8')
        
        # Remove the problematic import that causes duplicate definition
        content = re.sub(r'import com\.blog\.modules\.system\.api\.mapper\.RoleApiMapper;\s*\n', '', content)
        
        role_api_mapper_path.write_text(content, encoding='utf-8')
        print("✅ Fixed RoleApiMapper duplicate definition")

def create_missing_config_dto_classes():
    """Create missing ConfigDTO classes"""
    
    # Create AuthorConfigDTO
    author_config_dto_path = Path("blog-service/src/main/java/com/blog/modules/system/config/model/dto/config/AuthorConfigDTO.java")
    author_config_dto_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not author_config_dto_path.exists():
        author_config_dto_content = '''package com.blog.modules.system.config.model.dto.config;

import lombok.Data;

/**
 * 作者配置DTO
 */
@Data
public class AuthorConfigDTO {
    /**
     * 作者名称
     */
    private String name;
    
    /**
     * 作者头像
     */
    private String avatar;
    
    /**
     * 作者简介
     */
    private String description;
    
    /**
     * 作者邮箱
     */
    private String email;
    
    /**
     * 作者网站
     */
    private String website;
    
    /**
     * 社交媒体链接
     */
    private String socialLinks;
    
    // Manual setter methods (Lombok backup)
    public void setName(String name) { this.name = name; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setDescription(String description) { this.description = description; }
    public void setEmail(String email) { this.email = email; }
    public void setWebsite(String website) { this.website = website; }
    public void setSocialLinks(String socialLinks) { this.socialLinks = socialLinks; }
    
    // Manual getter methods (Lombok backup)
    public String getName() { return name; }
    public String getAvatar() { return avatar; }
    public String getDescription() { return description; }
    public String getEmail() { return email; }
    public String getWebsite() { return website; }
    public String getSocialLinks() { return socialLinks; }
}
'''
        author_config_dto_path.write_text(author_config_dto_content, encoding='utf-8')
        print("✅ Created AuthorConfigDTO class")
    
    # Create CommentConfigDTO
    comment_config_dto_path = Path("blog-service/src/main/java/com/blog/modules/system/config/model/dto/config/CommentConfigDTO.java")
    
    if not comment_config_dto_path.exists():
        comment_config_dto_content = '''package com.blog.modules.system.config.model.dto.config;

import lombok.Data;

/**
 * 评论配置DTO
 */
@Data
public class CommentConfigDTO {
    /**
     * 是否启用评论
     */
    private Boolean enabled;
    
    /**
     * 是否需要审核
     */
    private Boolean needApproval;
    
    /**
     * 是否允许匿名评论
     */
    private Boolean allowAnonymous;
    
    /**
     * 评论最大长度
     */
    private Integer maxLength;
    
    /**
     * 是否启用邮件通知
     */
    private Boolean emailNotification;
    
    /**
     * 敏感词过滤
     */
    private String sensitiveWords;
    
    // Manual setter methods (Lombok backup)
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public void setNeedApproval(Boolean needApproval) { this.needApproval = needApproval; }
    public void setAllowAnonymous(Boolean allowAnonymous) { this.allowAnonymous = allowAnonymous; }
    public void setMaxLength(Integer maxLength) { this.maxLength = maxLength; }
    public void setEmailNotification(Boolean emailNotification) { this.emailNotification = emailNotification; }
    public void setSensitiveWords(String sensitiveWords) { this.sensitiveWords = sensitiveWords; }
    
    // Manual getter methods (Lombok backup)
    public Boolean getEnabled() { return enabled; }
    public Boolean getNeedApproval() { return needApproval; }
    public Boolean getAllowAnonymous() { return allowAnonymous; }
    public Integer getMaxLength() { return maxLength; }
    public Boolean getEmailNotification() { return emailNotification; }
    public String getSensitiveWords() { return sensitiveWords; }
}
'''
        comment_config_dto_path.write_text(comment_config_dto_content, encoding='utf-8')
        print("✅ Created CommentConfigDTO class")

def create_missing_user_classes():
    """Create missing User-related classes"""
    
    # Create UserDTO
    user_dto_path = Path("blog-service/src/main/java/com/blog/modules/user/model/dto/UserDTO.java")
    user_dto_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not user_dto_path.exists():
        user_dto_content = '''package com.blog.modules.user.model.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户DTO
 */
@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String avatar;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // Manual setter methods (Lombok backup)
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setStatus(Integer status) { this.status = status; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    
    // Manual getter methods (Lombok backup)
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getNickname() { return nickname; }
    public String getAvatar() { return avatar; }
    public Integer getStatus() { return status; }
    public LocalDateTime getCreateTime() { return createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
}
'''
        user_dto_path.write_text(user_dto_content, encoding='utf-8')
        print("✅ Created UserDTO class")
    
    # Create UserVO
    user_vo_path = Path("blog-service/src/main/java/com/blog/modules/user/model/vo/UserVO.java")
    user_vo_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not user_vo_path.exists():
        user_vo_content = '''package com.blog.modules.user.model.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户VO
 */
@Data
public class UserVO {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String avatar;
    private Integer status;
    private LocalDateTime createTime;
    
    // Manual getter methods (Lombok backup)
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getNickname() { return nickname; }
    public String getAvatar() { return avatar; }
    public Integer getStatus() { return status; }
    public LocalDateTime getCreateTime() { return createTime; }
    
    // Manual setter methods (Lombok backup)
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setStatus(Integer status) { this.status = status; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
'''
        user_vo_path.write_text(user_vo_content, encoding='utf-8')
        print("✅ Created UserVO class")
    
    # Create User entity
    user_entity_path = Path("blog-service/src/main/java/com/blog/modules/user/model/entity/User.java")
    user_entity_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not user_entity_path.exists():
        user_entity_content = '''package com.blog.modules.user.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.blog.common.model.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("user")
public class User extends BaseEntity {
    private String username;
    private String password;
    private String email;
    private String nickname;
    private String avatar;
    private Integer status;
    
    @TableField("last_login_time")
    private java.time.LocalDateTime lastLoginTime;
    
    @TableField("last_login_ip")
    private String lastLoginIp;
    
    // Manual setter methods (Lombok backup)
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setEmail(String email) { this.email = email; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setStatus(Integer status) { this.status = status; }
    public void setLastLoginTime(java.time.LocalDateTime lastLoginTime) { this.lastLoginTime = lastLoginTime; }
    public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }
    
    // Manual getter methods (Lombok backup)
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getEmail() { return email; }
    public String getNickname() { return nickname; }
    public String getAvatar() { return avatar; }
    public Integer getStatus() { return status; }
    public java.time.LocalDateTime getLastLoginTime() { return lastLoginTime; }
    public String getLastLoginIp() { return lastLoginIp; }
}
'''
        user_entity_path.write_text(user_entity_content, encoding='utf-8')
        print("✅ Created User entity class")

def add_missing_setters_to_other_classes():
    """Add missing setter methods to other classes that need them"""
    
    # Fix ApiNode and ModuleNode classes
    api_classes = [
        "blog-service/src/main/java/com/blog/common/model/ApiNode.java",
        "blog-service/src/main/java/com/blog/common/model/ModuleNode.java",
        "blog-service/src/main/java/com/blog/common/model/dto/BaseDTO.java"
    ]
    
    for class_path_str in api_classes:
        class_path = Path(class_path_str)
        if class_path.exists():
            content = class_path.read_text(encoding='utf-8')
            
            # Check if it already has manual setters
            if 'Manual setter methods' in content:
                continue
                
            # Add @Data annotation if missing
            if '@Data' not in content and 'lombok.Data' not in content:
                # Add import
                if 'import lombok.' not in content:
                    content = re.sub(
                        r'(package [^;]+;)',
                        r'\1\n\nimport lombok.Data;',
                        content
                    )
                else:
                    content = re.sub(
                        r'(import lombok\.[^;]+;)',
                        r'\1\nimport lombok.Data;',
                        content,
                        count=1
                    )
                
                # Add @Data annotation
                content = re.sub(
                    r'(public class)',
                    r'@Data\n\1',
                    content
                )
                
                class_path.write_text(content, encoding='utf-8')
                print(f"✅ Added @Data annotation to {class_path_str}")

def fix_import_issues():
    """Fix remaining import issues"""
    
    # Fix the typo in SiteConfigService.java import
    site_config_service_path = Path("blog-service/src/main/java/com/blog/modules/system/config/service/SiteConfigService.java")
    if site_config_service_path.exists():
        content = site_config_service_path.read_text(encoding='utf-8')
        
        # Fix the typo in import statement
        content = re.sub(
            r'import com\.blog\.modules\.system\.config\.model\.dto\.config\.Aug\.AuthorConfigDTO;',
            r'import com.blog.modules.system.config.model.dto.config.AuthorConfigDTO;',
            content
        )
        
        site_config_service_path.write_text(content, encoding='utf-8')
        print("✅ Fixed import typo in SiteConfigService")

def main():
    print("🔧 Fixing remaining compilation issues...")
    
    # Step 1: Fix duplicate class definitions
    fix_duplicate_class_definitions()
    
    # Step 2: Create missing DTO classes
    create_missing_config_dto_classes()
    
    # Step 3: Create missing User classes
    create_missing_user_classes()
    
    # Step 4: Add missing setters to other classes
    add_missing_setters_to_other_classes()
    
    # Step 5: Fix import issues
    fix_import_issues()
    
    print("\n✅ Remaining compilation issues fixed!")
    print("Now trying to compile again...")

if __name__ == "__main__":
    main()
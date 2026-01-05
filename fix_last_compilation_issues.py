#!/usr/bin/env python3
"""
Fix the last remaining compilation issues
"""

import os
import re
from pathlib import Path

def fix_business_exception_imports():
    """Fix BusinessException import paths"""
    
    files_with_business_exception = [
        "blog-service/src/main/java/com/blog/core/config/SaTokenConfig.java",
        "blog-service/src/main/java/com/blog/core/interceptor/ApiPermissionInterceptor.java"
    ]
    
    for file_path_str in files_with_business_exception:
        file_path = Path(file_path_str)
        if file_path.exists():
            content = file_path.read_text(encoding='utf-8')
            
            # Replace com.blog.exception with com.blog.common.exception
            content = re.sub(
                r'com\.blog\.exception\.BusinessException',
                r'com.blog.common.exception.BusinessException',
                content
            )
            
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ Fixed BusinessException import in {file_path_str}")

def create_missing_plugin_core():
    """Create missing plugin core interface"""
    
    plugin_core_path = Path("blog-service/src/main/java/com/blog/plugin/core/Plugin.java")
    plugin_core_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not plugin_core_path.exists():
        plugin_core_content = '''package com.blog.plugin.core;

/**
 * 插件核心接口
 */
public interface Plugin {
    /**
     * 插件是否启用
     */
    boolean isEnabled();
    
    /**
     * 插件名称
     */
    String getName();
    
    /**
     * 插件版本
     */
    String getVersion();
}
'''
        plugin_core_path.write_text(plugin_core_content, encoding='utf-8')
        print("✅ Created Plugin core interface")

def create_missing_dto_classes():
    """Create missing DTO classes"""
    
    # Create ConfigDTO
    config_dto_path = Path("blog-service/src/main/java/com/blog/model/dto/ConfigDTO.java")
    config_dto_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not config_dto_path.exists():
        config_dto_content = '''package com.blog.model.dto;

import lombok.Data;

/**
 * 配置DTO
 */
@Data
public class ConfigDTO {
    private String key;
    private String value;
    private String description;
    
    // Manual setter methods (Lombok backup)
    public void setKey(String key) { this.key = key; }
    public void setValue(String value) { this.value = value; }
    public void setDescription(String description) { this.description = description; }
    
    // Manual getter methods (Lombok backup)
    public String getKey() { return key; }
    public String getValue() { return value; }
    public String getDescription() { return description; }
}
'''
        config_dto_path.write_text(config_dto_content, encoding='utf-8')
        print("✅ Created ConfigDTO class")
    
    # Add getPassword method to ResetPasswordDTO
    reset_password_dto_path = Path("blog-service/src/main/java/com/blog/modules/auth/model/dto/ResetPasswordDTO.java")
    if reset_password_dto_path.exists():
        content = reset_password_dto_path.read_text(encoding='utf-8')
        
        if 'private String password;' not in content:
            content = re.sub(
                r'(@Data\s*public class ResetPasswordDTO \{)',
                r'\1\n    private String password;\n    \n    // Manual getter method\n    public String getPassword() { return password; }\n    public void setPassword(String password) { this.password = password; }',
                content
            )
            
            reset_password_dto_path.write_text(content, encoding='utf-8')
            print("✅ Added password field to ResetPasswordDTO")

def create_missing_entity_classes():
    """Create missing entity classes"""
    
    # Create Comment entity
    comment_entity_path = Path("blog-service/src/main/java/com/blog/model/entity/Comment.java")
    comment_entity_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not comment_entity_path.exists():
        comment_entity_content = '''package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.blog.common.model.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 评论实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("comment")
public class Comment extends BaseEntity {
    @TableField("article_id")
    private Long articleId;
    
    @TableField("user_id")
    private Long userId;
    
    private String content;
    
    @TableField("parent_id")
    private Long parentId;
    
    private Integer status;
    
    // Manual setter methods (Lombok backup)
    public void setArticleId(Long articleId) { this.articleId = articleId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setContent(String content) { this.content = content; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public void setStatus(Integer status) { this.status = status; }
    
    // Manual getter methods (Lombok backup)
    public Long getArticleId() { return articleId; }
    public Long getUserId() { return userId; }
    public String getContent() { return content; }
    public Long getParentId() { return parentId; }
    public Integer getStatus() { return status; }
}
'''
        comment_entity_path.write_text(comment_entity_content, encoding='utf-8')
        print("✅ Created Comment entity class")

def create_missing_event_classes():
    """Create missing event classes"""
    
    event_dir = Path("blog-service/src/main/java/com/blog/modules/user/event")
    event_dir.mkdir(parents=True, exist_ok=True)
    
    # Create UserCreatedEvent
    user_created_event_path = event_dir / "UserCreatedEvent.java"
    if not user_created_event_path.exists():
        user_created_event_content = '''package com.blog.modules.user.event;

import org.springframework.context.ApplicationEvent;
import com.blog.modules.user.model.entity.User;

/**
 * 用户创建事件
 */
public class UserCreatedEvent extends ApplicationEvent {
    private final Long userId;
    private final User user;
    
    public UserCreatedEvent(Object source, Long userId, User user) {
        super(source);
        this.userId = userId;
        this.user = user;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public User getUser() {
        return user;
    }
}
'''
        user_created_event_path.write_text(user_created_event_content, encoding='utf-8')
        print("✅ Created UserCreatedEvent class")
    
    # Create UserUpdatedEvent
    user_updated_event_path = event_dir / "UserUpdatedEvent.java"
    if not user_updated_event_path.exists():
        user_updated_event_content = '''package com.blog.modules.user.event;

import org.springframework.context.ApplicationEvent;
import com.blog.modules.user.model.entity.User;

/**
 * 用户更新事件
 */
public class UserUpdatedEvent extends ApplicationEvent {
    private final Long userId;
    private final User user;
    
    public UserUpdatedEvent(Object source, Long userId, User user) {
        super(source);
        this.userId = userId;
        this.user = user;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public User getUser() {
        return user;
    }
}
'''
        user_updated_event_path.write_text(user_updated_event_content, encoding='utf-8')
        print("✅ Created UserUpdatedEvent class")
    
    # Create UserDeletedEvent
    user_deleted_event_path = event_dir / "UserDeletedEvent.java"
    if not user_deleted_event_path.exists():
        user_deleted_event_content = '''package com.blog.modules.user.event;

import org.springframework.context.ApplicationEvent;

/**
 * 用户删除事件
 */
public class UserDeletedEvent extends ApplicationEvent {
    private final Long userId;
    
    public UserDeletedEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }
    
    public Long getUserId() {
        return userId;
    }
}
'''
        user_deleted_event_path.write_text(user_deleted_event_content, encoding='utf-8')
        print("✅ Created UserDeletedEvent class")
    
    # Create UserPasswordResetEvent
    user_password_reset_event_path = event_dir / "UserPasswordResetEvent.java"
    if not user_password_reset_event_path.exists():
        user_password_reset_event_content = '''package com.blog.modules.user.event;

import org.springframework.context.ApplicationEvent;

/**
 * 用户密码重置事件
 */
public class UserPasswordResetEvent extends ApplicationEvent {
    private final Long userId;
    
    public UserPasswordResetEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }
    
    public Long getUserId() {
        return userId;
    }
}
'''
        user_password_reset_event_path.write_text(user_password_reset_event_content, encoding='utf-8')
        print("✅ Created UserPasswordResetEvent class")

def add_missing_methods_to_config_dtos():
    """Add missing methods to ConfigDTO classes"""
    
    # Add toPublicView method to AuthorConfigDTO
    author_config_dto_path = Path("blog-service/src/main/java/com/blog/modules/system/config/model/dto/config/AuthorConfigDTO.java")
    if author_config_dto_path.exists():
        content = author_config_dto_path.read_text(encoding='utf-8')
        
        if 'toPublicView' not in content:
            content = re.sub(
                r'(public String getSocialLinks\(\) \{ return socialLinks; \})',
                r'\1\n    \n    public AuthorConfigDTO toPublicView() {\n        // Return a copy with only public fields\n        AuthorConfigDTO publicView = new AuthorConfigDTO();\n        publicView.setName(this.name);\n        publicView.setAvatar(this.avatar);\n        publicView.setDescription(this.description);\n        publicView.setWebsite(this.website);\n        publicView.setSocialLinks(this.socialLinks);\n        return publicView;\n    }',
                content
            )
            
            author_config_dto_path.write_text(content, encoding='utf-8')
            print("✅ Added toPublicView method to AuthorConfigDTO")
    
    # Add toPublicView method to CommentConfigDTO
    comment_config_dto_path = Path("blog-service/src/main/java/com/blog/modules/system/config/model/dto/config/CommentConfigDTO.java")
    if comment_config_dto_path.exists():
        content = comment_config_dto_path.read_text(encoding='utf-8')
        
        if 'toPublicView' not in content:
            content = re.sub(
                r'(public String getSensitiveWords\(\) \{ return sensitiveWords; \})',
                r'\1\n    \n    public CommentConfigDTO toPublicView() {\n        // Return a copy with only public fields\n        CommentConfigDTO publicView = new CommentConfigDTO();\n        publicView.setEnabled(this.enabled);\n        publicView.setNeedApproval(this.needApproval);\n        publicView.setAllowAnonymous(this.allowAnonymous);\n        publicView.setMaxLength(this.maxLength);\n        return publicView;\n    }',
                content
            )
            
            comment_config_dto_path.write_text(content, encoding='utf-8')
            print("✅ Added toPublicView method to CommentConfigDTO")

def create_missing_mapper_methods():
    """Add missing methods to mapper classes"""
    
    # Add deleteByRoleId method to RoleApiMapper
    role_api_mapper_path = Path("blog-service/src/main/java/com/blog/modules/system/role/mapper/RoleApiMapper.java")
    if role_api_mapper_path.exists():
        content = role_api_mapper_path.read_text(encoding='utf-8')
        
        if 'deleteByRoleId' not in content:
            content = re.sub(
                r'(public interface RoleApiMapper extends BaseMapper<RoleApi> \{)',
                r'\1\n    \n    /**\n     * 根据角色ID删除角色API关联\n     */\n    void deleteByRoleId(Long roleId);',
                content
            )
            
            role_api_mapper_path.write_text(content, encoding='utf-8')
            print("✅ Added deleteByRoleId method to RoleApiMapper")

def fix_websocket_handler_method():
    """Fix WebSocket handler method signature"""
    
    websocket_plugin_path = Path("blog-service/src/main/java/com/blog/core/plugin/notification/impl/WebSocketChannelPlugin.java")
    if websocket_plugin_path.exists():
        content = websocket_plugin_path.read_text(encoding='utf-8')
        
        # Fix the method call to match the expected signature
        content = re.sub(
            r'webSocketHandler\.sendNotification\(userId, notification\);',
            r'webSocketHandler.sendNotification(String.valueOf(userId), notification);',
            content
        )
        
        websocket_plugin_path.write_text(content, encoding='utf-8')
        print("✅ Fixed WebSocket handler method signature")

def main():
    print("🔧 Fixing the last remaining compilation issues...")
    
    # Step 1: Fix BusinessException imports
    fix_business_exception_imports()
    
    # Step 2: Create missing plugin core
    create_missing_plugin_core()
    
    # Step 3: Create missing DTO classes
    create_missing_dto_classes()
    
    # Step 4: Create missing entity classes
    create_missing_entity_classes()
    
    # Step 5: Create missing event classes
    create_missing_event_classes()
    
    # Step 6: Add missing methods to ConfigDTO classes
    add_missing_methods_to_config_dtos()
    
    # Step 7: Create missing mapper methods
    create_missing_mapper_methods()
    
    # Step 8: Fix WebSocket handler method
    fix_websocket_handler_method()
    
    print("\n✅ All remaining compilation issues should now be fixed!")
    print("Ready for final compilation...")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Final fix for all compilation issues
"""

import os
import re
from pathlib import Path

def remove_duplicate_config_dto_files():
    """Remove duplicate ConfigDTO files that are causing conflicts"""
    
    # Remove the duplicate files in wrong locations
    duplicate_files = [
        "blog-service/src/main/java/com/blog/modules/auth/model/dto/AuthorConfigDTO.java",
        "blog-service/src/main/java/com/blog/modules/comment/model/dto/config/CommentConfigDTO.java"
    ]
    
    for file_path_str in duplicate_files:
        file_path = Path(file_path_str)
        if file_path.exists():
            file_path.unlink()
            print(f"✅ Removed duplicate file: {file_path_str}")

def fix_user_import_paths():
    """Fix User class import paths"""
    
    user_service_impl_path = Path("blog-service/src/main/java/com/blog/modules/user/service/impl/UserServiceImpl.java")
    if user_service_impl_path.exists():
        content = user_service_impl_path.read_text(encoding='utf-8')
        
        # Fix import paths
        content = re.sub(
            r'import com\.blog\.modules\.user\.UserDTO;',
            r'import com.blog.modules.user.model.dto.UserDTO;',
            content
        )
        content = re.sub(
            r'import com\.blog\.modules\.user\.UserVO;',
            r'import com.blog.modules.user.model.vo.UserVO;',
            content
        )
        content = re.sub(
            r'import com\.blog\.modules\.user\.User;',
            r'import com.blog.modules.user.model.entity.User;',
            content
        )
        
        user_service_impl_path.write_text(content, encoding='utf-8')
        print("✅ Fixed User class import paths")

def create_missing_exception_classes():
    """Create missing exception classes"""
    
    # Create BusinessException
    exception_dir = Path("blog-service/src/main/java/com/blog/common/exception")
    exception_dir.mkdir(parents=True, exist_ok=True)
    
    business_exception_path = exception_dir / "BusinessException.java"
    if not business_exception_path.exists():
        business_exception_content = '''package com.blog.common.exception;

/**
 * 业务异常
 */
public class BusinessException extends RuntimeException {
    private Integer code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
    }
    
    public Integer getCode() {
        return code;
    }
    
    public void setCode(Integer code) {
        this.code = code;
    }
}
'''
        business_exception_path.write_text(business_exception_content, encoding='utf-8')
        print("✅ Created BusinessException class")

def create_missing_entity_classes():
    """Create missing entity classes"""
    
    # Create Role entity
    role_entity_path = Path("blog-service/src/main/java/com/blog/modules/system/role/model/entity/Role.java")
    role_entity_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not role_entity_path.exists():
        role_entity_content = '''package com.blog.modules.system.role.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.blog.common.model.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("role")
public class Role extends BaseEntity {
    private String name;
    
    @TableField("role_key")
    private String roleKey;
    
    private String description;
    private Integer status;
    
    // Manual setter methods (Lombok backup)
    public void setName(String name) { this.name = name; }
    public void setRoleKey(String roleKey) { this.roleKey = roleKey; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(Integer status) { this.status = status; }
    
    // Manual getter methods (Lombok backup)
    public String getName() { return name; }
    public String getRoleKey() { return roleKey; }
    public String getDescription() { return description; }
    public Integer getStatus() { return status; }
}
'''
        role_entity_path.write_text(role_entity_content, encoding='utf-8')
        print("✅ Created Role entity class")
    
    # Create SysApi entity
    sys_api_entity_path = Path("blog-service/src/main/java/com/blog/modules/system/api/model/entity/SysApi.java")
    sys_api_entity_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not sys_api_entity_path.exists():
        sys_api_entity_content = '''package com.blog.modules.system.api.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.blog.common.model.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 系统API实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_api")
public class SysApi extends BaseEntity {
    @TableField("api_key")
    private String apiKey;
    
    private String name;
    private String path;
    private String method;
    private String description;
    
    @TableField("parent_id")
    private Long parentId;
    
    @TableField("is_open")
    private Integer isOpen;
    
    // Manual setter methods (Lombok backup)
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public void setName(String name) { this.name = name; }
    public void setPath(String path) { this.path = path; }
    public void setMethod(String method) { this.method = method; }
    public void setDescription(String description) { this.description = description; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public void setIsOpen(Integer isOpen) { this.isOpen = isOpen; }
    
    // Manual getter methods (Lombok backup)
    public String getApiKey() { return apiKey; }
    public String getName() { return name; }
    public String getPath() { return path; }
    public String getMethod() { return method; }
    public String getDescription() { return description; }
    public Long getParentId() { return parentId; }
    public Integer getIsOpen() { return isOpen; }
}
'''
        sys_api_entity_path.write_text(sys_api_entity_content, encoding='utf-8')
        print("✅ Created SysApi entity class")
    
    # Create RoleApi entity
    role_api_entity_path = Path("blog-service/src/main/java/com/blog/modules/system/role/model/entity/RoleApi.java")
    role_api_entity_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not role_api_entity_path.exists():
        role_api_entity_content = '''package com.blog.modules.system.role.model.entity;

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
'''
        role_api_entity_path.write_text(role_api_entity_content, encoding='utf-8')
        print("✅ Created RoleApi entity class")

def create_missing_vo_classes():
    """Create missing VO classes"""
    
    # Create RoleVO
    role_vo_path = Path("blog-service/src/main/java/com/blog/modules/system/role/model/vo/RoleVO.java")
    role_vo_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not role_vo_path.exists():
        role_vo_content = '''package com.blog.modules.system.role.model.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 角色VO
 */
@Data
public class RoleVO {
    private Long id;
    private String name;
    private String roleKey;
    private String description;
    private Integer status;
    private LocalDateTime createTime;
    
    // Manual setter methods (Lombok backup)
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setRoleKey(String roleKey) { this.roleKey = roleKey; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(Integer status) { this.status = status; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    
    // Manual getter methods (Lombok backup)
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getRoleKey() { return roleKey; }
    public String getDescription() { return description; }
    public Integer getStatus() { return status; }
    public LocalDateTime getCreateTime() { return createTime; }
}
'''
        role_vo_path.write_text(role_vo_content, encoding='utf-8')
        print("✅ Created RoleVO class")
    
    # Create UserVO with setRoles method
    user_vo_path = Path("blog-service/src/main/java/com/blog/modules/user/model/vo/UserVO.java")
    if user_vo_path.exists():
        content = user_vo_path.read_text(encoding='utf-8')
        
        # Add roles field and setRoles method if not exists
        if 'private List<RoleVO> roles;' not in content:
            content = re.sub(
                r'(import java\.time\.LocalDateTime;)',
                r'\1\nimport java.util.List;\nimport com.blog.modules.system.role.model.vo.RoleVO;',
                content
            )
            
            content = re.sub(
                r'(private LocalDateTime createTime;)',
                r'\1\n    private List<RoleVO> roles;',
                content
            )
            
            content = re.sub(
                r'(public void setCreateTime\(LocalDateTime createTime\) \{ this\.createTime = createTime; \})',
                r'\1\n    public void setRoles(List<RoleVO> roles) { this.roles = roles; }\n    public List<RoleVO> getRoles() { return roles; }',
                content
            )
            
            user_vo_path.write_text(content, encoding='utf-8')
            print("✅ Updated UserVO with roles field")

def create_missing_model_classes():
    """Create missing model classes"""
    
    # Create ApiNode
    api_node_path = Path("blog-service/src/main/java/com/blog/common/model/ApiNode.java")
    api_node_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not api_node_path.exists():
        api_node_content = '''package com.blog.common.model;

import lombok.Data;

/**
 * API节点模型
 */
@Data
public class ApiNode {
    private Long id;
    private String apiKey;
    private String name;
    private String path;
    private String method;
    private String description;
    private Integer isOpen;
    private String perms;
    private String type;
    private String version;
    private Boolean logOperation;
    private Boolean logException;
    
    // Manual setter methods (Lombok backup)
    public void setId(Long id) { this.id = id; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public void setName(String name) { this.name = name; }
    public void setPath(String path) { this.path = path; }
    public void setMethod(String method) { this.method = method; }
    public void setDescription(String description) { this.description = description; }
    public void setIsOpen(Integer isOpen) { this.isOpen = isOpen; }
    public void setPerms(String perms) { this.perms = perms; }
    public void setType(String type) { this.type = type; }
    public void setVersion(String version) { this.version = version; }
    public void setLogOperation(Boolean logOperation) { this.logOperation = logOperation; }
    public void setLogException(Boolean logException) { this.logException = logException; }
    
    // Manual getter methods (Lombok backup)
    public Long getId() { return id; }
    public String getApiKey() { return apiKey; }
    public String getName() { return name; }
    public String getPath() { return path; }
    public String getMethod() { return method; }
    public String getDescription() { return description; }
    public Integer getIsOpen() { return isOpen; }
    public String getPerms() { return perms; }
    public String getType() { return type; }
    public String getVersion() { return version; }
    public Boolean getLogOperation() { return logOperation; }
    public Boolean getLogException() { return logException; }
}
'''
        api_node_path.write_text(api_node_content, encoding='utf-8')
        print("✅ Created ApiNode class")
    
    # Create ModuleNode
    module_node_path = Path("blog-service/src/main/java/com/blog/common/model/ModuleNode.java")
    
    if not module_node_path.exists():
        module_node_content = '''package com.blog.common.model;

import lombok.Data;
import java.util.List;

/**
 * 模块节点模型
 */
@Data
public class ModuleNode {
    private String apiKey;
    private String name;
    private String description;
    private String path;
    private String method;
    private Integer isOpen;
    private String perms;
    private String version;
    private List<ApiNode> apis;
    
    // Manual setter methods (Lombok backup)
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPath(String path) { this.path = path; }
    public void setMethod(String method) { this.method = method; }
    public void setIsOpen(Integer isOpen) { this.isOpen = isOpen; }
    public void setPerms(String perms) { this.perms = perms; }
    public void setVersion(String version) { this.version = version; }
    public void setApis(List<ApiNode> apis) { this.apis = apis; }
    
    // Manual getter methods (Lombok backup)
    public String getApiKey() { return apiKey; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getPath() { return path; }
    public String getMethod() { return method; }
    public Integer getIsOpen() { return isOpen; }
    public String getPerms() { return perms; }
    public String getVersion() { return version; }
    public List<ApiNode> getApis() { return apis; }
}
'''
        module_node_path.write_text(module_node_content, encoding='utf-8')
        print("✅ Created ModuleNode class")
    
    # Create BaseDTO
    base_dto_path = Path("blog-service/src/main/java/com/blog/common/model/dto/BaseDTO.java")
    base_dto_path.parent.mkdir(parents=True, exist_ok=True)
    
    if not base_dto_path.exists():
        base_dto_content = '''package com.blog.common.model.dto;

import lombok.Data;

/**
 * 基础DTO
 */
@Data
public class BaseDTO {
    private Long current = 1L;
    private Long size = 10L;
    
    // Manual setter methods (Lombok backup)
    public void setCurrent(Long current) { this.current = current; }
    public void setSize(Long size) { this.size = size; }
    
    // Manual getter methods (Lombok backup)
    public Long getCurrent() { return current; }
    public Long getSize() { return size; }
}
'''
        base_dto_path.write_text(base_dto_content, encoding='utf-8')
        print("✅ Created BaseDTO class")

def fix_user_entity_missing_fields():
    """Add missing fields to User entity"""
    
    user_entity_path = Path("blog-service/src/main/java/com/blog/modules/user/model/entity/User.java")
    if user_entity_path.exists():
        content = user_entity_path.read_text(encoding='utf-8')
        
        # Add missing fields
        if 'ipAddressSignup' not in content:
            content = re.sub(
                r'(private String lastLoginIp;)',
                r'\1\n    \n    @TableField("ip_address_signup")\n    private String ipAddressSignup;\n    \n    @TableField("ip_source_signup")\n    private String ipSourceSignup;\n    \n    private String role;\n    \n    private Integer disabled;',
                content
            )
            
            # Add setter methods
            content = re.sub(
                r'(public String getLastLoginIp\(\) \{ return lastLoginIp; \})',
                r'\1\n    public void setIpAddressSignup(String ipAddressSignup) { this.ipAddressSignup = ipAddressSignup; }\n    public void setIpSourceSignup(String ipSourceSignup) { this.ipSourceSignup = ipSourceSignup; }\n    public void setRole(String role) { this.role = role; }\n    public void setDisabled(Integer disabled) { this.disabled = disabled; }\n    public String getIpAddressSignup() { return ipAddressSignup; }\n    public String getIpSourceSignup() { return ipSourceSignup; }\n    public String getRole() { return role; }\n    public Integer getDisabled() { return disabled; }',
                content
            )
            
            user_entity_path.write_text(content, encoding='utf-8')
            print("✅ Added missing fields to User entity")

def fix_result_class_duplicate_methods():
    """Fix duplicate methods in Result class"""
    
    result_path = Path("blog-service/src/main/java/com/blog/common/Result.java")
    if result_path.exists():
        content = result_path.read_text(encoding='utf-8')
        
        # Remove duplicate manual methods if they exist
        content = re.sub(
            r'\s*// Manual setter methods \(Lombok backup\).*?public LocalDateTime getTimestamp\(\) \{\s*return timestamp;\s*\}',
            '',
            content,
            flags=re.DOTALL
        )
        
        result_path.write_text(content, encoding='utf-8')
        print("✅ Fixed duplicate methods in Result class")

def add_slf4j_annotations():
    """Add @Slf4j annotations to classes that need logging"""
    
    classes_needing_slf4j = [
        "blog-service/src/main/java/com/blog/core/aspect/LogAspect.java",
        "blog-service/src/main/java/com/blog/common/exception/GlobalExceptionHandler.java",
        "blog-service/src/main/java/com/blog/core/cache/ApiResourceCache.java",
        "blog-service/src/main/java/com/blog/core/config/DataInitializer.java",
        "blog-service/src/main/java/com/blog/core/config/SaTokenConfig.java",
        "blog-service/src/main/java/com/blog/core/interceptor/ApiPermissionInterceptor.java"
    ]
    
    for class_path_str in classes_needing_slf4j:
        class_path = Path(class_path_str)
        if class_path.exists():
            content = class_path.read_text(encoding='utf-8')
            
            # Add @Slf4j import if not exists
            if 'import lombok.extern.slf4j.Slf4j;' not in content:
                content = re.sub(
                    r'(import lombok\.[^;]+;)',
                    r'\1\nimport lombok.extern.slf4j.Slf4j;',
                    content,
                    count=1
                )
            
            # Add @Slf4j annotation if not exists
            if '@Slf4j' not in content:
                content = re.sub(
                    r'(@Component|@RestControllerAdvice|@Aspect|@Configuration|@Service)\s*\n(public class)',
                    r'@Slf4j\n\1\n\2',
                    content
                )
            
            class_path.write_text(content, encoding='utf-8')
            print(f"✅ Added @Slf4j to {class_path_str}")

def main():
    print("🔧 Final fix for all compilation issues...")
    
    # Step 1: Remove duplicate files
    remove_duplicate_config_dto_files()
    
    # Step 2: Fix import paths
    fix_user_import_paths()
    
    # Step 3: Create missing exception classes
    create_missing_exception_classes()
    
    # Step 4: Create missing entity classes
    create_missing_entity_classes()
    
    # Step 5: Create missing VO classes
    create_missing_vo_classes()
    
    # Step 6: Create missing model classes
    create_missing_model_classes()
    
    # Step 7: Fix User entity missing fields
    fix_user_entity_missing_fields()
    
    # Step 8: Fix Result class duplicate methods
    fix_result_class_duplicate_methods()
    
    # Step 9: Add @Slf4j annotations
    add_slf4j_annotations()
    
    print("\n✅ All compilation issues should now be fixed!")
    print("Ready to compile again...")

if __name__ == "__main__":
    main()
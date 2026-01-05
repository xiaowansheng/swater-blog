import os
import re
from pathlib import Path

def fix_config_dto_imports():
    base_path = Path(r"blog-service\src\main\java\com\blog")
    
    fixed_count = 0
    
    print("Adding missing ConfigDTO imports...")
    
    # 配置DTO类映射
    config_dtos = {
        'SiteConfigDTO': 'com.blog.modules.system.config.model.dto.config.SiteConfigDTO',
        'AuthorConfigDTO': 'com.blog.modules.system.config.model.dto.config.AuthorConfigDTO',
        'CoverConfigDTO': 'com.blog.modules.system.config.model.dto.config.CoverConfigDTO',
        'SocialConfigDTO': 'com.blog.modules.system.config.model.dto.config.SocialConfigDTO',
        'PrivacyConfigDTO': 'com.blog.modules.system.config.model.dto.config.PrivacyConfigDTO',
        'CommentConfigDTO': 'com.blog.modules.system.config.model.dto.config.CommentConfigDTO',
        'NotifyConfigDTO': 'com.blog.modules.system.config.model.dto.config.NotifyConfigDTO',
        'UploadConfigDTO': 'com.blog.modules.system.config.model.dto.config.UploadConfigDTO',
        'EmailConfigDTO': 'com.blog.modules.system.config.model.dto.config.EmailConfigDTO',
        'ConfigDTO': 'com.blog.modules.system.config.model.dto.ConfigDTO',
    }
    
    # 遍历所有Java文件
    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 检查文件中是否使用了这些DTO类
            for dto_name, full_import in config_dtos.items():
                if dto_name in content and f'import {full_import};' not in content:
                    # 在package声明后添加导入
                    content = re.sub(r'(package [^;]+;)', f'\\1\n\nimport {full_import};', content)
            
            # 添加其他缺失的导入
            if 'RoleApiMapper' in content and 'import com.blog.modules.system.api.mapper.RoleApiMapper;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.modules.system.api.mapper.RoleApiMapper;', content)
            
            if 'ResetPasswordDTO' in content and 'import com.blog.modules.user.model.dto.ResetPasswordDTO;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.modules.user.model.dto.ResetPasswordDTO;', content)
            
            # 移除错误的通配符导入
            content = re.sub(r'import com\.blog\.modules\.user\.\*;', '', content)
            
            # 清理多余的空行
            content = re.sub(r'\n\n\n+', '\n\n', content)
            
            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[FIXED] {java_file.relative_to(base_path)}")
                fixed_count += 1
                
        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    fix_config_dto_imports()
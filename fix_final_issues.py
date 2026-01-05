import os
import re
from pathlib import Path

def fix_final_issues():
    base_path = Path(r"blog-service\src\main\java\com\blog")
    
    fixed_count = 0
    
    print("Fixing final compilation issues...")
    
    # 遍历所有Java文件
    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 1. 移除循环导入
            content = re.sub(r'import com\.blog\.modules\.system\.config\.model\.dto\.(\w+);', '', content)
            content = re.sub(r'import com\.blog\.common\.model\.dto\.config\.\*;', '', content)
            
            # 2. 移除错误的导入
            content = re.sub(r'import com\.blog\.modules\.system\.api\.mapper\.RoleApiMapper;', '', content)
            content = re.sub(r'import com\.blog\.common\.model\.dto\.ResetPasswordDTO;', '', content)
            
            # 3. 修复包声明中的错误路径
            if 'config/config/' in str(java_file):
                # 这些文件在错误的位置，需要修复包声明
                content = re.sub(r'package com\.blog\.modules\.system\.config\.model\.dto\.config;', 
                               'package com.blog.modules.system.config.model.dto.config;', content)
            
            # 4. 对于配置DTO文件，移除自引用导入
            if java_file.name.endswith('ConfigDTO.java'):
                # 移除自引用导入
                dto_name = java_file.name.replace('.java', '')
                content = re.sub(f'import com\\.blog\\.modules\\.system\\.config\\.model\\.dto\\.{dto_name};', '', content)
            
            # 5. 清理多余的空行
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
    fix_final_issues()
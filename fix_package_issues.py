import os
import re
from pathlib import Path

def fix_package_issues():
    base_path = Path(r"blog-service\src\main\java\com\blog")
    
    fixed_count = 0
    
    print("Fixing package and import issues...")
    
    # 修复规则
    fixes = [
        # 1. 修复事件类的导入
        (r'import com\.blog\.event\.article\.', 'import com.blog.modules.article.'),
        (r'import com\.blog\.event\.comment\.', 'import com.blog.modules.comment.'),
        (r'import com\.blog\.event\.user\.', 'import com.blog.modules.user.'),
        (r'import com\.blog\.event\.talk\.', 'import com.blog.modules.talk.'),
        (r'import com\.blog\.event\.file\.', 'import com.blog.modules.file.'),
        (r'import com\.blog\.event\.guestbook\.', 'import com.blog.modules.guestbook.'),
        
        # 2. 修复基础类导入
        (r'extends BaseDTO', 'extends com.blog.common.model.dto.BaseDTO'),
        (r'extends BaseVO', 'extends com.blog.common.model.vo.BaseVO'),
        (r'extends com\.blog\.common\.model\.BaseMapper', 'extends com.blog.common.model.BaseMapper'),
        
        # 3. 修复通用模型导入
        (r'import com\.blog\.model\.dto\.', 'import com.blog.common.model.dto.'),
        (r'import com\.blog\.model\.vo\.', 'import com.blog.common.model.vo.'),
        (r'import com\.blog\.model\.entity\.', 'import com.blog.common.model.entity.'),
        
        # 4. 修复Service导入
        (r'import com\.blog\.service\.', 'import com.blog.modules.system.role.service.'),
        
        # 5. 修复WebSocket导入
        (r'import com\.blog\.core\.websocket\.', 'import com.blog.core.websocket.'),
        
        # 6. 修复过度简化的包声明 - 恢复正确的包结构
        (r'package com\.blog\.modules\.content;', 'package com.blog.modules.content.about.service;'),
        (r'package com\.blog\.modules\.statistics;', 'package com.blog.modules.statistics.visitor.service;'),
        (r'package com\.blog\.modules\.system;', 'package com.blog.modules.system.config.service;'),
    ]
    
    # 遍历所有Java文件
    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 应用修复规则
            for pattern, replacement in fixes:
                content = re.sub(pattern, replacement, content)
            
            # 特殊处理：根据文件路径修复包声明
            rel_path = java_file.relative_to(base_path)
            parts = list(rel_path.parts)
            
            if len(parts) > 1 and parts[-1].endswith('.java'):
                parts = parts[:-1]  # 移除文件名
                
                # 构建正确的包名
                if parts[0] == 'modules':
                    package_parts = ['com', 'blog', 'modules']
                    
                    # 添加模块名
                    if len(parts) > 1:
                        package_parts.append(parts[1])
                    
                    # 添加子模块路径
                    if len(parts) > 2:
                        package_parts.extend(parts[2:])
                    
                    correct_package = f"package {'.'.join(package_parts)};"
                    
                    # 查找并替换package声明
                    package_pattern = r'package\s+[^;]+;'
                    if re.search(package_pattern, content):
                        content = re.sub(package_pattern, correct_package, content)
            
            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[FIXED] {java_file.relative_to(base_path)}")
                fixed_count += 1
                
        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    fix_package_issues()
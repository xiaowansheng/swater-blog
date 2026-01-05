import os
import re
from pathlib import Path

def fix_final_imports():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    fixed_count = 0

    print("Fixing final imports...")

    # 移除通配符import并添加具体的import
    wildcard_replacements = {
        'com.blog.modules.user': [
            'UserDTO',
            'UserVO',
            'User',
        ],
        'com.blog.modules.system.role': [
            'RoleDTO',
            'RoleVO',
        ],
        # 可以添加更多的通配符替换
    }

    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # 移除通配符import
            for package, classes in wildcard_replacements.items():
                wildcard_pattern = f'import {package}.*;'
                if wildcard_pattern in content:
                    # 找到通配符import的行
                    lines = content.split('\n')
                    new_lines = []
                    for line in lines:
                        if wildcard_pattern in line:
                            # 替换为具体的import
                            for cls in classes:
                                new_lines.append(f'import {package}.{cls};')
                        else:
                            new_lines.append(line)
                    content = '\n'.join(new_lines)

            # 修复其他的import
            content = re.sub(r'import com\.blog\.modules\.system\.role\.\*;',
                           'import com.blog.modules.system.role.model.dto.RoleDTO;\nimport com.blog.modules.system.role.model.vo.RoleVO;\nimport com.blog.modules.system.role.model.entity.Role;',
                           content)

            content = re.sub(r'import com\.blog\.modules\.user\.\*;',
                           'import com.blog.modules.user.model.dto.UserDTO;\nimport com.blog.modules.user.model.vo.UserVO;\nimport com.blog.modules.user.model.entity.User;',
                           content)

            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1

        except Exception as e:
            pass

    print(f"Fixed {fixed_count} files with wildcard imports")

if __name__ == '__main__':
    fix_final_imports()

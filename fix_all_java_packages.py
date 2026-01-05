import os
import re
from pathlib import Path

def fix_all_java_packages():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    fixed_count = 0
    verified_count = 0
    error_count = 0

    print("Starting package verification and fix...")
    print(f"Base path: {base_path}\n")

    # 遍历所有Java文件
    for java_file in sorted(base_path.rglob("*.java")):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()

            lines = content.split('\n')
            if not lines:
                continue

            # 找到package声明行
            package_line_idx = None
            for i, line in enumerate(lines):
                if line.strip().startswith('package '):
                    package_line_idx = i
                    break

            if package_line_idx is None:
                continue

            current_package = lines[package_line_idx].strip()
            rel_path = java_file.relative_to(base_path)
            parts = list(rel_path.parts)

            # 移除文件名
            if parts[-1].endswith('.java'):
                parts = parts[:-1]

            # 根据文件路径构建正确的包名
            expected_package = None

            if parts[0] == 'modules':
                # modules/{module}/{type}/{subtype}/{file}
                # 或 modules/{module}/model/{category}/{file}
                package_parts = ['com', 'blog', 'modules']

                # 添加模块名
                if len(parts) > 1:
                    package_parts.append(parts[1])

                # 添加剩余路径
                if len(parts) > 2:
                    package_parts.extend(parts[2:])

                expected_package = f"package {'.'.join(package_parts)};"

            elif parts[0] == 'common':
                package_parts = ['com', 'blog', 'common']
                if len(parts) > 1:
                    package_parts.extend(parts[1:])
                expected_package = f"package {'.'.join(package_parts)};"

            elif parts[0] == 'core':
                package_parts = ['com', 'blog', 'core']
                if len(parts) > 1:
                    package_parts.extend(parts[1:])
                expected_package = f"package {'.'.join(package_parts)};"

            if expected_package and current_package != expected_package:
                # 需要修复
                lines[package_line_idx] = expected_package
                new_content = '\n'.join(lines)

                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                print(f"[FIXED] {java_file.relative_to(base_path)}")
                print(f"  OLD: {current_package}")
                print(f"  NEW: {expected_package}")
                fixed_count += 1
            else:
                verified_count += 1

        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {str(e)}")
            error_count += 1

    print(f"\n" + "="*60)
    print(f"Verification complete!")
    print(f"  Total files processed: {fixed_count + verified_count + error_count}")
    print(f"  Fixed:     {fixed_count} files")
    print(f"  Verified:  {verified_count} files (already correct)")
    print(f"  Errors:    {error_count} files")
    print("="*60)

if __name__ == '__main__':
    fix_all_java_packages()

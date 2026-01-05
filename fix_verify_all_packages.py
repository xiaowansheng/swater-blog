import os
import re
from pathlib import Path

def fix_and_verify_all_packages():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    fixed_count = 0
    verified_count = 0
    error_count = 0

    print("Starting package verification and fix...")
    print(f"Base path: {base_path}\n")

    # 遍历所有Java文件
    for java_file in base_path.rglob("*.java"):
        try:
            # 读取文件
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
                print(f"[NO PACKAGE] {java_file.relative_to(base_path)}")
                error_count += 1
                continue

            current_package = lines[package_line_idx].strip()
            rel_path = java_file.relative_to(base_path)
            parts = list(rel_path.parts)

            # 移除文件名
            if parts[-1].endswith('.java'):
                parts = parts[:-1]

            # 计算正确的包名
            if parts[0] == 'modules':
                package_parts = ['com', 'blog', 'modules']

                # 找到model目录的位置
                model_idx = -1
                for i, part in enumerate(parts):
                    if part == 'model':
                        model_idx = i
                        break

                if model_idx > 0:
                    # 添加模块名
                    package_parts.append(parts[1])

                    # 如果model前面有子模块（如system/api, system/config）
                    if model_idx > 2:
                        for i in range(2, model_idx):
                            package_parts.append(parts[i])

                    # 添加model和类型
                    if model_idx + 1 < len(parts):
                        package_parts.extend(['model', parts[model_idx + 1]])

                        # 如果还有更深层的子目录（如dto/config）
                        if model_idx + 2 < len(parts):
                            package_parts.append(parts[model_idx + 2])
                else:
                    # 没有model目录，检查是否有其他标准目录
                    if len(parts) > 1:
                        package_parts.append(parts[1])
                        if len(parts) > 2 and parts[2] in ['controller', 'service', 'mapper', 'listener']:
                            package_parts.append(parts[2])
                            if len(parts) > 3 and parts[3] in ['admin', 'public', 'impl']:
                                package_parts.append(parts[3])

                expected_package = f"package {'.'.join(package_parts)};"

            elif parts[0] == 'common':
                package_parts = ['com', 'blog', 'common']

                if 'model' in parts:
                    model_idx = parts.index('model')
                    if model_idx == 1:
                        # common/model直接下的文件
                        if len(parts) > 2:
                            package_parts.extend(['model', parts[2]])
                            if len(parts) > 3:
                                package_parts.append(parts[3])
                    else:
                        package_parts.extend(parts[1:])
                else:
                    # common下的其他目录
                    package_parts.extend(parts[1:])

                expected_package = f"package {'.'.join(package_parts)};"

            elif parts[0] == 'core':
                package_parts = ['com', 'blog', 'core']

                # 处理plugin目录
                if len(parts) > 1 and parts[1] == 'plugin':
                    package_parts.append('plugin')
                    if len(parts) > 2:
                        package_parts.append(parts[2])
                        if len(parts) > 3 and parts[3] in ['impl', 'processor']:
                            package_parts.append(parts[3])
                            if len(parts) > 4:
                                package_parts.append(parts[4])
                else:
                    # core下的其他目录
                    if len(parts) > 1:
                        package_parts.append(parts[1])
                        if len(parts) > 2 and parts[2] in ['impl', 'config', 'aspect']:
                            package_parts.append(parts[2])

                expected_package = f"package {'.'.join(package_parts)};"

            else:
                print(f"[UNKNOWN STRUCTURE] {java_file.relative_to(base_path)}")
                error_count += 1
                continue

            # 检查包名是否匹配
            if current_package != expected_package:
                # 需要修复
                lines[package_line_idx] = expected_package
                new_content = '\n'.join(lines)

                # 写回文件
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                print(f"[FIXED] {java_file.relative_to(base_path)}")
                print(f"  OLD: {current_package}")
                print(f"  NEW: {expected_package}")
                fixed_count += 1
            else:
                verified_count += 1

        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {e}")
            error_count += 1

    print(f"\n" + "="*60)
    print(f"Verification complete!")
    print(f"  Total files processed: {fixed_count + verified_count + error_count}")
    print(f"  Fixed:     {fixed_count} files")
    print(f"  Verified:  {verified_count} files (already correct)")
    print(f"  Errors:    {error_count} files")
    print("="*60)

if __name__ == '__main__':
    fix_and_verify_all_packages()

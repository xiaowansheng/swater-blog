import os
import re
from pathlib import Path

def fix_package_declaration():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    fixed_count = 0
    skipped_count = 0

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
                skipped_count += 1
                continue

            old_package = lines[package_line_idx].strip()

            # 如果已经是正确的格式，跳过
            if '{1}' not in old_package and '{2}' not in old_package and not re.search(r'package com\.blog\.modules\.\.model\.', old_package):
                skipped_count += 1
                continue

            # 根据文件路径计算正确的包名
            rel_path = java_file.relative_to(base_path)
            parts = list(rel_path.parts)

            # 移除文件名
            if parts[-1].endswith('.java'):
                parts = parts[:-1]

            # 构建正确的包名
            if parts[0] == 'modules':
                # modules目录下的文件
                # com.blog.modules.{module}[.{submodule}].model.{type}[.{sub_type}]
                package_parts = ['com', 'blog', 'modules']

                # 找到model目录的位置
                model_idx = -1
                for i, part in enumerate(parts):
                    if part == 'model':
                        model_idx = i
                        break

                if model_idx > 0:
                    # 添加模块名
                    package_parts.append(parts[1])  # article, comment, user, system, etc.

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
                    # 没有model目录，直接使用路径
                    package_parts.extend(parts[1:])

                new_package = f"package {'.'.join(package_parts)};"

            elif parts[0] == 'common':
                # common目录下的文件
                package_parts = ['com', 'blog', 'common']

                # 检查是否有model目录
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
                    # common下的其他目录（annotation, constant等）
                    package_parts.extend(parts[1:])

                new_package = f"package {'.'.join(package_parts)};"

            elif parts[0] == 'core':
                # core目录下的文件
                package_parts = ['com', 'blog', 'core']

                # 处理plugin目录
                if len(parts) > 1 and parts[1] == 'plugin':
                    package_parts.append('plugin')
                    if len(parts) > 2:
                        # 添加子模块
                        package_parts.append(parts[2])
                        if len(parts) > 3:
                            package_parts.append(parts[3])
                else:
                    # core下的其他目录
                    if len(parts) > 1:
                        package_parts.append(parts[1])
                        if len(parts) > 2:
                            package_parts.append(parts[2])

                new_package = f"package {'.'.join(package_parts)};"

            else:
                print(f"[SKIP] {java_file}")
                skipped_count += 1
                continue

            # 替换package声明
            lines[package_line_idx] = new_package
            new_content = '\n'.join(lines)

            # 写回文件
            with open(java_file, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"[FIXED] {java_file}")
            print(f"  OLD: {old_package}")
            print(f"  NEW: {new_package}")
            fixed_count += 1

        except Exception as e:
            print(f"[ERROR] {java_file} - {e}")

    print(f"\nDone!")
    print(f"  Fixed: {fixed_count} files")
    print(f"  Skipped: {skipped_count} files")

if __name__ == '__main__':
    fix_package_declaration()

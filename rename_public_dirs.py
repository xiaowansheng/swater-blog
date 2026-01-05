import os
import shutil
from pathlib import Path

def rename_public_to_pub():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    print("Renaming 'public' directories to 'pub'...")
    renamed_count = 0

    # 找到所有名为 'public' 的目录
    for public_dir in sorted(base_path.rglob('public')):
        if public_dir.is_dir():
            # 新的目录名
            parent = public_dir.parent
            new_dir = parent / 'pub'

            try:
                # 重命名目录
                shutil.move(str(public_dir), str(new_dir))
                print(f"[RENAMED] {public_dir.relative_to(base_path)} -> pub/")
                renamed_count += 1
            except Exception as e:
                print(f"[ERROR] Failed to rename {public_dir.relative_to(base_path)}: {e}")

    print(f"\nRenamed {renamed_count} directories")

    # 现在更新所有Java文件中的import语句
    print("\nUpdating import statements...")
    updated_count = 0

    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # 替换所有 .public. 为 .pub.
            content = content.replace('.public.', '.pub.')
            # 替换包声明中的 .controller.public; 为 .controller.pub;
            content = content.replace('controller.public;', 'controller.pub;')

            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_count += 1

        except Exception as e:
            print(f"[ERROR] Failed to update {java_file}: {e}")

    print(f"Updated {updated_count} files")
    print("\nDone!")

if __name__ == '__main__':
    rename_public_to_pub()

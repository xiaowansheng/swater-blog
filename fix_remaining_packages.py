import os
import re

base_path = r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog\modules"

# Walk through all Java files and fix remaining package issues
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.java'):
            file_path = os.path.join(root, file)

            # Read file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix malformed package declarations
            if '{1}' in content or '{2}' in content:
                # Extract module and submodule from path
                rel_path = os.path.relpath(file_path, base_path)
                parts = rel_path.split(os.sep)

                if len(parts) >= 3:
                    module = parts[0]  # e.g., system, content, statistics, user
                    submodule = parts[1] if parts[1] != 'model' else None
                    model_type = parts[2] if parts[2] != 'model' else parts[3] if len(parts) > 3 else 'entity'

                    # Determine correct package
                    if submodule and submodule != 'model':
                        package_name = f'com.blog.modules.{module}.{submodule}.model.{model_type}'
                    else:
                        package_name = f'com.blog.modules.{module}.model.{model_type}'

                    # Replace malformed package
                    content = re.sub(r'package com\.blog\.modules\.\{1\}\.\{2\}\.model\.[^;]+;', f'package {package_name};', content)
                    content = re.sub(r'package com\.blog\.modules\.\{1\}\.\{2\}\.', f'package {package_name}.', content)

                    # Write back
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)

                    print(f"Fixed: {file_path}")

print("All package declarations fixed!")

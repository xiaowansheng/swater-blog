import os
import re

base_path = r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog\modules"

# Walk through all Java files in modules directory
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.java'):
            file_path = os.path.join(root, file)

            # Extract module name from path (e.g., article, comment, etc.)
            rel_path = os.path.relpath(file_path, base_path)
            parts = rel_path.split(os.sep)

            if len(parts) >= 3 and parts[1] == 'model':
                module = parts[0]
                model_type = parts[2]  # entity, dto, vo, enums, document, message

                # Read file
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Fix package declaration
                old_package = re.compile(r'^package com\.blog\.model\.' + model_type + ';', re.MULTILINE)
                if module in ['system', 'content', 'statistics']:
                    # For aggregated modules, use submodule path
                    if len(parts) >= 4:
                        submodule = parts[1] if parts[1] != 'model' else module
                        new_package = f'package com.blog.modules.{module}.{submodule}.model.{model_type};'
                        content = re.sub(r'^package com\.blog\.model\.' + model_type + ';', new_package, content, flags=re.MULTILINE)
                else:
                    new_package = f'package com.blog.modules.{module}.model.{model_type};'
                    content = old_package.sub(new_package, content)

                # Write back
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"Fixed: {file_path}")

print("Package fixing completed!")

#!/usr/bin/env python3
"""
Fix Lombok @Data annotation issues by ensuring proper configuration
and adding explicit setter methods where needed.
"""

import os
import re
from pathlib import Path

def fix_lombok_configuration():
    """Fix Lombok configuration in build.gradle.kts"""
    build_file = Path("blog-service/build.gradle.kts")
    
    if not build_file.exists():
        print(f"Build file not found: {build_file}")
        return
    
    content = build_file.read_text(encoding='utf-8')
    
    # Check if annotation processing is properly configured
    if 'annotationProcessor("org.projectlombok:lombok")' not in content:
        print("Adding proper Lombok annotation processor configuration...")
        
        # Find the dependencies section and add proper Lombok configuration
        dependencies_pattern = r'(dependencies\s*\{[^}]*)(compileOnly\("org\.projectlombok:lombok"\)\s*annotationProcessor\("org\.projectlombok:lombok"\))'
        
        if re.search(dependencies_pattern, content, re.DOTALL):
            # Already has both, but let's make sure they're in the right order
            content = re.sub(
                r'(dependencies\s*\{[^}]*?)(compileOnly\("org\.projectlombok:lombok"\)\s*annotationProcessor\("org\.projectlombok:lombok"\))',
                r'\1// --- Lombok Configuration ---\n    compileOnly("org.projectlombok:lombok")\n    annotationProcessor("org.projectlombok:lombok")\n    testCompileOnly("org.projectlombok:lombok")\n    testAnnotationProcessor("org.projectlombok:lombok")',
                content,
                flags=re.DOTALL
            )
        else:
            # Add proper Lombok configuration
            content = re.sub(
                r'(compileOnly\("org\.projectlombok:lombok"\)\s*annotationProcessor\("org\.projectlombok:lombok"\))',
                r'// --- Lombok Configuration ---\n    compileOnly("org.projectlombok:lombok")\n    annotationProcessor("org.projectlombok:lombok")\n    testCompileOnly("org.projectlombok:lombok")\n    testAnnotationProcessor("org.projectlombok:lombok")',
                content
            )
        
        build_file.write_text(content, encoding='utf-8')
        print("✅ Updated Lombok configuration in build.gradle.kts")

def add_lombok_config_file():
    """Add lombok.config file to ensure proper configuration"""
    config_file = Path("blog-service/lombok.config")
    
    config_content = """# Lombok Configuration
lombok.addLombokGeneratedAnnotation = true
lombok.anyConstructor.addConstructorProperties = true
lombok.copyableAnnotations += org.springframework.beans.factory.annotation.Qualifier
lombok.copyableAnnotations += org.springframework.beans.factory.annotation.Value
lombok.copyableAnnotations += org.springframework.boot.context.properties.ConfigurationProperties
"""
    
    config_file.write_text(config_content, encoding='utf-8')
    print("✅ Created lombok.config file")

def fix_entity_annotations():
    """Fix entity class annotations to ensure Lombok works properly"""
    
    # Find all entity files that need fixing
    entity_files = [
        "blog-service/src/main/java/com/blog/modules/system/log/model/entity/LogOperation.java",
        "blog-service/src/main/java/com/blog/modules/system/log/model/entity/LogError.java",
        "blog-service/src/main/java/com/blog/common/Result.java",
        "blog-service/src/main/java/com/blog/common/model/entity/BaseEntity.java"
    ]
    
    for file_path in entity_files:
        path = Path(file_path)
        if not path.exists():
            print(f"File not found: {file_path}")
            continue
            
        content = path.read_text(encoding='utf-8')
        original_content = content
        
        # Ensure proper import order and annotations
        if '@Data' in content and 'import lombok.Data;' in content:
            # Check if we need to add @Getter and @Setter explicitly
            if '@Getter' not in content and '@Setter' not in content:
                # Add explicit @Getter and @Setter imports and annotations
                if 'import lombok.Data;' in content:
                    content = content.replace(
                        'import lombok.Data;',
                        'import lombok.Data;\nimport lombok.Getter;\nimport lombok.Setter;'
                    )
                
                # Add @Getter and @Setter annotations before @Data
                content = re.sub(
                    r'(@Data)',
                    r'@Getter\n@Setter\n\1',
                    content
                )
        
        if content != original_content:
            path.write_text(content, encoding='utf-8')
            print(f"✅ Fixed annotations in {file_path}")

def clean_duplicate_imports():
    """Clean up any duplicate imports that might cause issues"""
    
    # Find all Java files in the project
    java_files = []
    for root, dirs, files in os.walk("blog-service/src"):
        for file in files:
            if file.endswith('.java'):
                java_files.append(os.path.join(root, file))
    
    fixed_count = 0
    
    for file_path in java_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Remove duplicate imports
            lines = content.split('\n')
            imports = []
            other_lines = []
            in_imports = False
            
            for line in lines:
                if line.strip().startswith('import '):
                    in_imports = True
                    if line not in imports:
                        imports.append(line)
                elif line.strip().startswith('package ') or line.strip() == '' or line.strip().startswith('//'):
                    other_lines.append(line)
                else:
                    if in_imports:
                        in_imports = False
                        other_lines.extend(imports)
                        imports = []
                    other_lines.append(line)
            
            if imports:
                other_lines.extend(imports)
            
            content = '\n'.join(other_lines)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    if fixed_count > 0:
        print(f"✅ Cleaned duplicate imports in {fixed_count} files")

def main():
    print("🔧 Fixing Lombok @Data annotation issues...")
    
    # Step 1: Fix Lombok configuration
    fix_lombok_configuration()
    
    # Step 2: Add lombok.config file
    add_lombok_config_file()
    
    # Step 3: Fix entity annotations
    fix_entity_annotations()
    
    # Step 4: Clean duplicate imports
    clean_duplicate_imports()
    
    print("\n✅ Lombok fixes completed!")
    print("\nNext steps:")
    print("1. Run: cd blog-service && ./gradlew clean")
    print("2. Run: ./gradlew build -x test")
    print("3. If issues persist, restart your IDE to refresh annotation processing")

if __name__ == "__main__":
    main()
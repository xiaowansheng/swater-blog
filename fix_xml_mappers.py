#!/usr/bin/env python3
import os
import re

def fix_xml_mapper_file(file_path):
    """Fix package references in XML mapper files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix namespace mappings
        namespace_mappings = {
            'com.blog.mapper.VisitStatisticsMapper': 'com.blog.modules.statistics.mapper.VisitStatisticsMapper',
            'com.blog.mapper.RoleMenuMapper': 'com.blog.modules.system.role.mapper.RoleMenuMapper',
            'com.blog.mapper.RoleApiMapper': 'com.blog.modules.system.role.mapper.RoleApiMapper',
            'com.blog.mapper.PictureMapper': 'com.blog.modules.picture.mapper.PictureMapper',
            'com.blog.mapper.LogOperationMapper': 'com.blog.modules.log.mapper.LogOperationMapper',
            'com.blog.mapper.LogErrorMapper': 'com.blog.modules.log.mapper.LogErrorMapper',
            'com.blog.mapper.FileReferenceMapper': 'com.blog.modules.file.mapper.FileReferenceMapper',
            'com.blog.mapper.ArticleTagMapper': 'com.blog.modules.article.mapper.ArticleTagMapper',
            'com.blog.mapper.ArticleMapper': 'com.blog.modules.article.mapper.ArticleMapper'
        }
        
        # Fix entity class mappings
        entity_mappings = {
            'com.blog.model.entity.VisitStatistics': 'com.blog.modules.statistics.model.entity.VisitStatistics',
            'com.blog.model.entity.Picture': 'com.blog.modules.picture.model.entity.Picture',
            'com.blog.model.entity.FileReference': 'com.blog.modules.file.model.entity.FileReference',
            'com.blog.model.entity.ArticleTag': 'com.blog.modules.article.model.entity.ArticleTag',
            'com.blog.model.entity.Article': 'com.blog.modules.article.model.entity.Article'
        }
        
        # Apply namespace fixes
        for old_namespace, new_namespace in namespace_mappings.items():
            content = content.replace(f'namespace="{old_namespace}"', f'namespace="{new_namespace}"')
        
        # Apply entity class fixes
        for old_entity, new_entity in entity_mappings.items():
            content = content.replace(f'resultType="{old_entity}"', f'resultType="{new_entity}"')
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {file_path}")
            return True
        else:
            print(f"No changes needed: {file_path}")
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Fix all XML mapper files"""
    mapper_dir = "blog-service/src/main/resources/mapper"
    
    if not os.path.exists(mapper_dir):
        print(f"Mapper directory not found: {mapper_dir}")
        return
    
    fixed_count = 0
    for filename in os.listdir(mapper_dir):
        if filename.endswith('.xml'):
            file_path = os.path.join(mapper_dir, filename)
            if fix_xml_mapper_file(file_path):
                fixed_count += 1
    
    print(f"\nFixed {fixed_count} XML mapper files")

if __name__ == "__main__":
    main()
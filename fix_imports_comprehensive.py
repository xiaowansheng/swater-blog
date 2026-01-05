import os
import re
from pathlib import Path

def fix_imports_comprehensive():
    base_path = Path(r"blog-service\src\main\java\com\blog")
    
    fixed_count = 0
    
    print("Fixing all import issues comprehensively...")
    
    # 导入修复规则
    import_fixes = [
        # 1. 修复事件类导入 - 从错误的event包路径修复到正确的模块路径
        (r'import com\.blog\.event\.article\.(\w+);', r'import com.blog.modules.article.event.\1;'),
        (r'import com\.blog\.event\.comment\.(\w+);', r'import com.blog.modules.comment.event.\1;'),
        (r'import com\.blog\.event\.user\.(\w+);', r'import com.blog.modules.user.event.user.\1;'),
        (r'import com\.blog\.event\.talk\.(\w+);', r'import com.blog.modules.talk.event.talk.\1;'),
        (r'import com\.blog\.event\.file\.(\w+);', r'import com.blog.modules.file.event.file.\1;'),
        (r'import com\.blog\.event\.guestbook\.(\w+);', r'import com.blog.modules.guestbook.event.\1;'),
        
        # 2. 修复通用模型导入
        (r'import com\.blog\.model\.dto\.(\w+);', r'import com.blog.common.model.dto.\1;'),
        (r'import com\.blog\.model\.vo\.(\w+);', r'import com.blog.common.model.vo.\1;'),
        (r'import com\.blog\.model\.entity\.(\w+);', r'import com.blog.common.model.entity.\1;'),
        
        # 3. 修复Service导入 - 需要根据具体的Service类型
        (r'import com\.blog\.service\.RoleService;', 'import com.blog.modules.system.role.service.RoleService;'),
        (r'import com\.blog\.service\.UserService;', 'import com.blog.modules.user.service.UserService;'),
        (r'import com\.blog\.service\.ConfigService;', 'import com.blog.modules.system.config.service.ConfigService;'),
        (r'import com\.blog\.service\.ConfigPublicService;', 'import com.blog.modules.system.config.service.ConfigPublicService;'),
        (r'import com\.blog\.service\.LogErrorService;', 'import com.blog.modules.system.log.service.LogErrorService;'),
        (r'import com\.blog\.service\.LogOperationService;', 'import com.blog.modules.system.log.service.LogOperationService;'),
        
        # 4. 修复Mapper导入 - 已经在之前的脚本中处理过，但确保完整
        (r'import com\.blog\.mapper\.(\w+);', r'import com.blog.modules.{module}.mapper.\1;'),
        
        # 5. 修复WebSocket导入
        (r'import com\.blog\.core\.websocket\.(\w+);', r'import com.blog.core.websocket.\1;'),
        
        # 6. 修复特定模块的Service导入
        (r'import com\.blog\.modules\.content\.about\.service\.(\w+);', r'import com.blog.modules.content.about.service.\1;'),
        (r'import com\.blog\.modules\.content\.picture\.service\.(\w+);', r'import com.blog.modules.content.picture.service.\1;'),
        (r'import com\.blog\.modules\.content\.picture\.mapper\.(\w+);', r'import com.blog.modules.content.picture.mapper.\1;'),
        (r'import com\.blog\.modules\.system\.config\.service\.(\w+);', r'import com.blog.modules.system.config.service.\1;'),
        (r'import com\.blog\.modules\.system\.log\.service\.(\w+);', r'import com.blog.modules.system.log.service.\1;'),
        (r'import com\.blog\.modules\.system\.log\.mapper\.(\w+);', r'import com.blog.modules.system.log.mapper.\1;'),
        (r'import com\.blog\.modules\.system\.role\.service\.(\w+);', r'import com.blog.modules.system.role.service.\1;'),
        (r'import com\.blog\.modules\.system\.role\.mapper\.(\w+);', r'import com.blog.modules.system.role.mapper.\1;'),
        (r'import com\.blog\.modules\.system\.api\.mapper\.(\w+);', r'import com.blog.modules.system.api.mapper.\1;'),
        (r'import com\.blog\.modules\.system\.api\.service\.(\w+);', r'import com.blog.modules.system.api.service.\1;'),
        (r'import com\.blog\.modules\.system\.menu\.service\.(\w+);', r'import com.blog.modules.system.menu.service.\1;'),
        (r'import com\.blog\.modules\.system\.menu\.mapper\.(\w+);', r'import com.blog.modules.system.menu.mapper.\1;'),
    ]
    
    # 特殊的Mapper映射规则
    mapper_mappings = {
        'ArticleMapper': 'com.blog.modules.article.mapper.ArticleMapper',
        'ArticleTagMapper': 'com.blog.modules.article.mapper.ArticleTagMapper',
        'CommentMapper': 'com.blog.modules.comment.mapper.CommentMapper',
        'UserMapper': 'com.blog.modules.user.mapper.UserMapper',
        'CategoryMapper': 'com.blog.modules.category.mapper.CategoryMapper',
        'TagMapper': 'com.blog.modules.tag.mapper.TagMapper',
        'AlbumMapper': 'com.blog.modules.album.mapper.AlbumMapper',
        'ArchiveMapper': 'com.blog.modules.archive.mapper.ArchiveMapper',
        'FriendLinkMapper': 'com.blog.modules.friendlink.mapper.FriendLinkMapper',
        'TalkMapper': 'com.blog.modules.talk.mapper.TalkMapper',
        'GuestbookMapper': 'com.blog.modules.guestbook.mapper.GuestbookMapper',
        'FileMetaMapper': 'com.blog.modules.file.mapper.FileMetaMapper',
        'FileReferenceMapper': 'com.blog.modules.file.mapper.FileReferenceMapper',
        'RoleMapper': 'com.blog.modules.system.role.mapper.RoleMapper',
        'RoleMenuMapper': 'com.blog.modules.system.role.mapper.RoleMenuMapper',
        'RoleApiMapper': 'com.blog.modules.system.api.mapper.RoleApiMapper',
        'SysMenuMapper': 'com.blog.modules.system.menu.mapper.SysMenuMapper',
        'SysConfigMapper': 'com.blog.modules.system.config.mapper.SysConfigMapper',
        'SysApiMapper': 'com.blog.modules.system.api.mapper.SysApiMapper',
        'SysNotificationMapper': 'com.blog.modules.notification.mapper.SysNotificationMapper',
        'LogErrorMapper': 'com.blog.modules.system.log.mapper.LogErrorMapper',
        'LogOperationMapper': 'com.blog.modules.system.log.mapper.LogOperationMapper',
        'PictureMapper': 'com.blog.modules.content.picture.mapper.PictureMapper',
        'VisitorMapper': 'com.blog.modules.statistics.visitor.mapper.VisitorMapper',
        'VisitorAccessLogMapper': 'com.blog.modules.statistics.visitor.mapper.VisitorAccessLogMapper',
        'VisitStatisticsMapper': 'com.blog.modules.statistics.statistics.mapper.VisitStatisticsMapper',
    }
    
    # 遍历所有Java文件
    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 应用通用导入修复规则
            for pattern, replacement in import_fixes:
                content = re.sub(pattern, replacement, content)
            
            # 应用Mapper特殊映射
            for mapper_name, correct_import in mapper_mappings.items():
                # 修复错误的mapper导入
                wrong_patterns = [
                    f'import com.blog.mapper.{mapper_name};',
                    f'import com.blog.{mapper_name};'
                ]
                for wrong_pattern in wrong_patterns:
                    content = content.replace(wrong_pattern, f'import {correct_import};')
            
            # 修复extends语句中的BaseMapper引用
            content = re.sub(r'extends com\.blog\.common\.model\.BaseMapper<', 'extends com.blog.common.model.BaseMapper<', content)
            
            # 修复extends BaseDTO和BaseVO
            content = re.sub(r'extends BaseDTO', 'extends com.blog.common.model.dto.BaseDTO', content)
            content = re.sub(r'extends BaseVO', 'extends com.blog.common.model.vo.BaseVO', content)
            
            # 添加缺失的导入
            if 'extends com.blog.common.model.dto.BaseDTO' in content and 'import com.blog.common.model.dto.BaseDTO;' not in content:
                # 在package声明后添加导入
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.common.model.dto.BaseDTO;', content)
            
            if 'extends com.blog.common.model.vo.BaseVO' in content and 'import com.blog.common.model.vo.BaseVO;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.common.model.vo.BaseVO;', content)
            
            if 'extends com.blog.common.model.BaseMapper' in content and 'import com.blog.common.model.BaseMapper;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.common.model.BaseMapper;', content)
            
            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[FIXED] {java_file.relative_to(base_path)}")
                fixed_count += 1
                
        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    fix_imports_comprehensive()
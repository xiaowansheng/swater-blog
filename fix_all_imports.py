import os
import re
from pathlib import Path

def fix_all_imports():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    fixed_count = 0
    verified_count = 0

    # Import映射规则
    import_mappings = {
        # Mapper相关
        r'import com\.blog\.mapper\.': [
            ('ArticleMapper', 'import com.blog.modules.article.mapper.ArticleMapper;'),
            ('ArticleTagMapper', 'import com.blog.modules.article.mapper.ArticleTagMapper;'),
            ('CommentMapper', 'import com.blog.modules.comment.mapper.CommentMapper;'),
            ('UserMapper', 'import com.blog.modules.user.mapper.UserMapper;'),
            ('CategoryMapper', 'import com.blog.modules.category.mapper.CategoryMapper;'),
            ('TagMapper', 'import com.blog.modules.tag.mapper.TagMapper;'),
            ('AlbumMapper', 'import com.blog.modules.album.mapper.AlbumMapper;'),
            ('ArchiveMapper', 'import com.blog.modules.archive.mapper.ArchiveMapper;'),
            ('FriendLinkMapper', 'import com.blog.modules.friendlink.mapper.FriendLinkMapper;'),
            ('TalkMapper', 'import com.blog.modules.talk.mapper.TalkMapper;'),
            ('GuestbookMapper', 'import com.blog.modules.guestbook.mapper.GuestbookMapper;'),
            ('FileMetaMapper', 'import com.blog.modules.file.mapper.FileMetaMapper;'),
            ('FileReferenceMapper', 'import com.blog.modules.file.mapper.FileReferenceMapper;'),
            ('RoleMapper', 'import com.blog.modules.system.role.mapper.RoleMapper;'),
            ('RoleMenuMapper', 'import com.blog.modules.system.role.mapper.RoleMenuMapper;'),
            ('RoleApiMapper', 'import com.blog.modules.system.api.mapper.RoleApiMapper;'),
            ('SysMenuMapper', 'import com.blog.modules.system.menu.mapper.SysMenuMapper;'),
            ('SysConfigMapper', 'import com.blog.modules.system.config.mapper.SysConfigMapper;'),
            ('SysApiMapper', 'import com.blog.modules.system.api.mapper.SysApiMapper;'),
            ('SysNotificationMapper', 'import com.blog.modules.notification.mapper.SysNotificationMapper;'),
            ('LogErrorMapper', 'import com.blog.modules.system.log.mapper.LogErrorMapper;'),
            ('LogOperationMapper', 'import com.blog.modules.system.log.mapper.LogOperationMapper;'),
            ('PictureMapper', 'import com.blog.modules.content.picture.mapper.PictureMapper;'),
            ('VisitorMapper', 'import com.blog.modules.statistics.visitor.mapper.VisitorMapper;'),
            ('VisitorAccessLogMapper', 'import com.blog.modules.statistics.visitor.mapper.VisitorAccessLogMapper;'),
            ('VisitStatisticsMapper', 'import com.blog.modules.statistics.statistics.mapper.VisitStatisticsMapper;'),
        ],

        # Service相关
        r'import com\.blog\.service\.': [
            # ... (这里可以添加更多的service映射)
        ],

        # Controller相关
        r'import com\.blog\.controller\.': [
            # ... (controller通常不会被其他类import，所以可以省略)
        ],

        # Metrics
        r'import com\.blog\.metrics\.BlogMetrics;': 'import com.blog.core.metrics.BlogMetrics;',

        # Event相关
        r'import com\.blog\.event\.': [
            ('ArticleCreatedEvent', 'import com.blog.modules.article.event.ArticleCreatedEvent;'),
            ('CommentCreatedEvent', 'import com.blog.modules.comment.event.CommentCreatedEvent;'),
            # ... 其他事件
        ],
    }

    print("Fixing all import statements...")

    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content
            modifications = 0

            # 应用映射规则
            for pattern, replacements in import_mappings.items():
                if isinstance(replacements, str):
                    # 简单替换
                    content = re.sub(pattern, replacements, content)
                    if content != original_content:
                        modifications += 1
                elif isinstance(replacements, list):
                    # 列表替换
                    for old_name, new_import in replacements:
                        pattern = re.escape(f'import com.blog.{old_name.split(".")[-1]};')
                        # 更精确的匹配
                        if old_name in content:
                            # 构建旧的import语句
                            old_parts = old_name.split('.')
                            if old_parts[0] == 'mapper':
                                old_import = f'import com.blog.mapper.{old_parts[-1]};'
                            elif old_parts[0] == 'metrics':
                                old_import = f'import com.blog.metrics.{old_parts[-1]};'
                            elif old_parts[0] == 'event':
                                old_import = f'import com.blog.event.{old_parts[-1]};'
                            else:
                                old_import = f'import com.blog.service.{old_parts[-1]};'

                            content = content.replace(old_import, new_import)
                            if content != original_content:
                                modifications += 1

            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[FIXED] {java_file.relative_to(base_path)} ({modifications} modifications)")
                fixed_count += 1
            else:
                verified_count += 1

        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {e}")

    print(f"\n" + "="*60)
    print(f"Import fix complete!")
    print(f"  Fixed:     {fixed_count} files")
    print(f"  Verified:  {verified_count} files")
    print("="*60)

if __name__ == '__main__':
    fix_all_imports()

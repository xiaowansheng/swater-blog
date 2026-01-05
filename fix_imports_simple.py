import os
import re
from pathlib import Path

def fix_all_imports_simple():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    fixed_count = 0

    print("Fixing all import statements...")

    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # 批量替换所有import语句
            # Mapper imports
            content = re.sub(r'import com\.blog\.mapper\.ArticleMapper;',
                           'import com.blog.modules.article.mapper.ArticleMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.ArticleTagMapper;',
                           'import com.blog.modules.article.mapper.ArticleTagMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.CommentMapper;',
                           'import com.blog.modules.comment.mapper.CommentMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.UserMapper;',
                           'import com.blog.modules.user.mapper.UserMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.RoleMapper;',
                           'import com.blog.modules.system.role.mapper.RoleMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.RoleMenuMapper;',
                           'import com.blog.modules.system.role.mapper.RoleMenuMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.RoleApiMapper;',
                           'import com.blog.modules.system.api.mapper.RoleApiMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.SysMenuMapper;',
                           'import com.blog.modules.system.menu.mapper.SysMenuMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.SysConfigMapper;',
                           'import com.blog.modules.system.config.mapper.SysConfigMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.SysApiMapper;',
                           'import com.blog.modules.system.api.mapper.SysApiMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.SysNotificationMapper;',
                           'import com.blog.modules.notification.mapper.SysNotificationMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.LogErrorMapper;',
                           'import com.blog.modules.system.log.mapper.LogErrorMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.LogOperationMapper;',
                           'import com.blog.modules.system.log.mapper.LogOperationMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.CategoryMapper;',
                           'import com.blog.modules.category.mapper.CategoryMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.TagMapper;',
                           'import com.blog.modules.tag.mapper.TagMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.AlbumMapper;',
                           'import com.blog.modules.album.mapper.AlbumMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.ArchiveMapper;',
                           'import com.blog.modules.archive.mapper.ArchiveMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.FriendLinkMapper;',
                           'import com.blog.modules.friendlink.mapper.FriendLinkMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.TalkMapper;',
                           'import com.blog.modules.talk.mapper.TalkMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.GuestbookMapper;',
                           'import com.blog.modules.guestbook.mapper.GuestbookMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.FileMetaMapper;',
                           'import com.blog.modules.file.mapper.FileMetaMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.FileReferenceMapper;',
                           'import com.blog.modules.file.mapper.FileReferenceMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.PictureMapper;',
                           'import com.blog.modules.content.picture.mapper.PictureMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.VisitorMapper;',
                           'import com.blog.modules.statistics.visitor.mapper.VisitorMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.VisitorAccessLogMapper;',
                           'import com.blog.modules.statistics.visitor.mapper.VisitorAccessLogMapper;', content)
            content = re.sub(r'import com\.blog\.mapper\.VisitStatisticsMapper;',
                           'import com.blog.modules.statistics.statistics.mapper.VisitStatisticsMapper;', content)

            # Metrics
            content = re.sub(r'import com\.blog\.metrics\.BlogMetrics;',
                           'import com.blog.core.metrics.BlogMetrics;', content)

            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1

        except Exception as e:
            pass

    print(f"Fixed {fixed_count} files")

if __name__ == '__main__':
    fix_all_imports_simple()

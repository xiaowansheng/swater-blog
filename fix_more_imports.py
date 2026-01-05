import os
import re
from pathlib import Path

def fix_remaining_imports():
    base_path = Path(r"D:\Workspace\Personal Project\Develop Project\swater-blog\blog-service\src\main\java\com\blog")

    fixed_count = 0

    print("Fixing remaining imports...")

    replacements = [
        # Service imports
        (r'import com\.blog\.service\.LogErrorService;', 'import com.blog.modules.system.log.service.LogErrorService;'),
        (r'import com\.blog\.service\.LogOperationService;', 'import com.blog.modules.system.log.service.LogOperationService;'),
        (r'import com\.blog\.service\.ArticleAdminCommandService;', 'import com.blog.modules.article.service.ArticleAdminCommandService;'),
        (r'import com\.blog\.service\.ArticleAdminQueryService;', 'import com.blog.modules.article.service.ArticleAdminQueryService;'),
        (r'import com\.blog\.service\.ArticlePublicQueryService;', 'import com.blog.modules.article.service.ArticlePublicQueryService;'),
        (r'import com\.blog\.service\.ArticleSaveService;', 'import com.blog.modules.article.service.ArticleSaveService;'),
        (r'import com\.blog\.service\.CommentAdminCommandService;', 'import com.blog.modules.comment.service.CommentAdminCommandService;'),
        (r'import com\.blog\.service\.CommentAdminQueryService;', 'import com.blog.modules.comment.service.CommentAdminQueryService;'),
        (r'import com\.blog\.service\.CommentPublicCommandService;', 'import com.blog.modules.comment.service.CommentPublicCommandService;'),
        (r'import com\.blog\.service\.CommentPublicQueryService;', 'import com.blog.modules.comment.service.CommentPublicQueryService;'),
        (r'import com\.blog\.service\.UserService;', 'import com.blog.modules.user.service.UserService;'),
        (r'import com\.blog\.service\.RoleService;', 'import com.blog.modules.system.role.service.RoleService;'),
        (r'import com\.blog\.service\.MenuService;', 'import com.blog.modules.system.menu.service.MenuService;'),
        (r'import com\.blog\.service\.ConfigService;', 'import com.blog.modules.system.config.service.ConfigService;'),
        (r'import com\.blog\.service\.ApiService;', 'import com.blog.modules.system.api.service.ApiService;'),
        (r'import com\.blog\.service\.TagService;', 'import com.blog.modules.tag.service.TagService;'),
        (r'import com\.blog\.service\.CategoryService;', 'import com.blog.modules.category.service.CategoryService;'),
        (r'import com\.blog\.service\.TalkAdminCommandService;', 'import com.blog.modules.talk.service.TalkAdminCommandService;'),
        (r'import com\.blog\.service\.TalkAdminQueryService;', 'import com.blog.modules.talk.service.TalkAdminQueryService;'),
        (r'import com\.blog\.service\.TalkPublicQueryService;', 'import com.blog.modules.talk.service.TalkPublicQueryService;'),
        (r'import com\.blog\.service\.GuestbookAdminCommandService;', 'import com.blog.modules.guestbook.service.GuestbookAdminCommandService;'),
        (r'import com\.blog\.service\.GuestbookAdminQueryService;', 'import com.blog.modules.guestbook.service.GuestbookAdminQueryService;'),
        (r'import com\.blog\.service\.GuestbookPublicCommandService;', 'import com.blog.modules.guestbook.service.GuestbookPublicCommandService;'),
        (r'import com\.blog\.service\.GuestbookPublicQueryService;', 'import com.blog.modules.guestbook.service.GuestbookPublicQueryService;'),
        (r'import com\.blog\.service\.FileService;', 'import com.blog.modules.file.service.FileService;'),
        (r'import com\.blog\.service\.AlbumService;', 'import com.blog.modules.album.service.AlbumService;'),
        (r'import com\.blog\.service\.AlbumPublicQueryService;', 'import com.blog.modules.album.service.AlbumPublicQueryService;'),
        (r'import com\.blog\.service\.ArchiveService;', 'import com.blog.modules.archive.service.ArchiveService;'),
        (r'import com\.blog\.service\.FriendLinkService;', 'import com.blog.modules.friendlink.service.FriendLinkService;'),
        (r'import com\.blog\.service\.FriendLinkPublicQueryService;', 'import com.blog.modules.friendlink.service.FriendLinkPublicQueryService;'),
        (r'import com\.blog\.service\.AboutService;', 'import com.blog.modules.content.about.service.AboutService;'),
        (r'import com\.blog\.service\.AboutPublicService;', 'import com.blog.modules.content.about.service.AboutPublicService;'),
        (r'import com\.blog\.service\.PictureService;', 'import com.blog.modules.content.picture.service.PictureService;'),
        (r'import com\.blog\.service\.PicturePublicQueryService;', 'import com.blog.modules.content.picture.service.PicturePublicQueryService;'),
        (r'import com\.blog\.service\.VisitorService;', 'import com.blog.modules.statistics.visitor.service.VisitorService;'),
        (r'import com\.blog\.service\.VisitStatisticsService;', 'import com.blog.modules.statistics.statistics.service.VisitStatisticsService;'),
        (r'import com\.blog\.service\.NotificationService;', 'import com.blog.modules.notification.service.NotificationService;'),
        (r'import com\.blog\.service\.SearchService;', 'import com.blog.modules.search.service.SearchService;'),
        (r'import com\.blog\.service\.SearchSyncService;', 'import com.blog.modules.search.service.SearchSyncService;'),
        (r'import com\.blog\.service\.SiteConfigService;', 'import com.blog.modules.system.config.service.SiteConfigService;'),
        (r'import com\.blog\.service\.ConfigPublicService;', 'import com.blog.modules.system.config.service.ConfigPublicService;'),
        (r'import com\.blog\.service\.MenuPublicService;', 'import com.blog.modules.system.menu.service.MenuPublicService;'),
        (r'import com\.blog\.service\.ApiResourceService;', 'import com.blog.modules.system.api.service.ApiResourceService;'),
        (r'import com\.blog\.service\.AuthService;', 'import com.blog.modules.auth.service.AuthService;'),

        # BaseEntity and BaseMapper
        (r'import com\.blog\.model\.entity\.BaseEntity;', 'import com.blog.common.model.entity.BaseEntity;'),
        (r'extends BaseEntity', 'extends com.blog.common.model.entity.BaseEntity'),

        # BaseMapper in interface extends
        (r'extends com\.blog\.mapper\.BaseMapper<', 'extends com.blog.common.model.BaseMapper<'),
    ]

    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # 应用所有替换规则
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)

            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1

        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {e}")

    print(f"Fixed {fixed_count} files")

if __name__ == '__main__':
    fix_remaining_imports()

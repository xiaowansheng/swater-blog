import os
import re
from pathlib import Path

def fix_all_remaining_issues():
    base_path = Path(r"blog-service\src\main\java\com\blog")
    
    fixed_count = 0
    
    print("Fixing all remaining import and reference issues...")
    
    # 遍历所有Java文件
    for java_file in base_path.rglob("*.java"):
        try:
            with open(java_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # 1. 修复事件类的导入路径
            content = re.sub(r'import com\.blog\.modules\.article\.ArticleCreatedEvent;', 'import com.blog.modules.article.event.ArticleCreatedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.article\.ArticleUpdatedEvent;', 'import com.blog.modules.article.event.ArticleUpdatedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.article\.ArticleDeletedEvent;', 'import com.blog.modules.article.event.ArticleDeletedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.article\.ArticlePublishedEvent;', 'import com.blog.modules.article.event.ArticlePublishedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.article\.ArticleUnpublishedEvent;', 'import com.blog.modules.article.event.ArticleUnpublishedEvent;', content)
            
            content = re.sub(r'import com\.blog\.modules\.comment\.CommentCreatedEvent;', 'import com.blog.modules.comment.event.CommentCreatedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.comment\.CommentUpdatedEvent;', 'import com.blog.modules.comment.event.CommentUpdatedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.comment\.CommentDeletedEvent;', 'import com.blog.modules.comment.event.CommentDeletedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.comment\.CommentApprovedEvent;', 'import com.blog.modules.comment.event.CommentApprovedEvent;', content)
            
            content = re.sub(r'import com\.blog\.modules\.user\.UserLoggedInEvent;', 'import com.blog.modules.user.event.user.UserLoggedInEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.user\.UserLoggedOutEvent;', 'import com.blog.modules.user.event.user.UserLoggedOutEvent;', content)
            
            content = re.sub(r'import com\.blog\.modules\.talk\.TalkCreatedEvent;', 'import com.blog.modules.talk.event.talk.TalkCreatedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.talk\.TalkUpdatedEvent;', 'import com.blog.modules.talk.event.talk.TalkUpdatedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.talk\.TalkDeletedEvent;', 'import com.blog.modules.talk.event.talk.TalkDeletedEvent;', content)
            
            content = re.sub(r'import com\.blog\.modules\.file\.FileDeletedEvent;', 'import com.blog.modules.file.event.file.FileDeletedEvent;', content)
            content = re.sub(r'import com\.blog\.modules\.file\.FileUploadedEvent;', 'import com.blog.modules.file.event.file.FileUploadedEvent;', content)
            
            content = re.sub(r'import com\.blog\.modules\.guestbook\.GuestbookCreatedEvent;', 'import com.blog.modules.guestbook.event.GuestbookCreatedEvent;', content)
            
            # 2. 修复通配符导入
            content = re.sub(r'import com\.blog\.modules\.article\.\*;', 'import com.blog.modules.article.event.*;', content)
            content = re.sub(r'import com\.blog\.modules\.comment\.\*;', 'import com.blog.modules.comment.event.*;', content)
            content = re.sub(r'import com\.blog\.modules\.talk\.\*;', 'import com.blog.modules.talk.event.talk.*;', content)
            content = re.sub(r'import com\.blog\.modules\.guestbook\.\*;', 'import com.blog.modules.guestbook.event.*;', content)
            
            # 3. 修复Repository导入
            content = re.sub(r'import com\.blog\.repository\.(\w+);', r'import com.blog.core.repository.\1;', content)
            
            # 4. 修复Service导入中的错误路径
            content = re.sub(r'private com\.blog\.service\.RoleService', 'private com.blog.modules.system.role.service.RoleService', content)
            
            # 5. 修复VO类的导入 - 需要添加缺失的导入
            if 'List<RoleVO>' in content and 'import com.blog.modules.system.role.model.vo.RoleVO;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.modules.system.role.model.vo.RoleVO;', content)
            
            if 'List<TagVO>' in content and 'import com.blog.modules.tag.model.vo.TagVO;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.modules.tag.model.vo.TagVO;', content)
            
            if 'List<PictureVO>' in content and 'import com.blog.modules.content.picture.model.vo.PictureVO;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.modules.content.picture.model.vo.PictureVO;', content)
            
            if 'UserVO' in content and 'import com.blog.modules.user.model.vo.UserVO;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.modules.user.model.vo.UserVO;', content)
            
            # 6. 修复特定的DTO类导入
            if 'LoginDTO' in content and 'import com.blog.modules.auth.model.dto.LoginDTO;' not in content:
                content = re.sub(r'import com\.blog\.common\.model\.dto\.LoginDTO;', 'import com.blog.modules.auth.model.dto.LoginDTO;', content)
            
            if 'LoginVO' in content and 'import com.blog.modules.auth.model.vo.LoginVO;' not in content:
                content = re.sub(r'import com\.blog\.common\.model\.vo\.LoginVO;', 'import com.blog.modules.auth.model.vo.LoginVO;', content)
            
            # 7. 修复ApiResourceVO导入
            if 'ApiResourceVO' in content and 'import com.blog.modules.system.api.model.vo.ApiResourceVO;' not in content:
                content = re.sub(r'import com\.blog\.common\.model\.vo\.ApiResourceVO;', 'import com.blog.modules.system.api.model.vo.ApiResourceVO;', content)
            
            # 8. 修复配置DTO类的导入 - 这些应该在system.config.model.dto包中
            config_dtos = [
                'SiteConfigDTO', 'AuthorConfigDTO', 'CoverConfigDTO', 'SocialConfigDTO',
                'PrivacyConfigDTO', 'CommentConfigDTO', 'NotifyConfigDTO', 'UploadConfigDTO', 'EmailConfigDTO'
            ]
            
            for dto in config_dtos:
                if dto in content and f'import com.blog.modules.system.config.model.dto.{dto};' not in content:
                    content = re.sub(r'(package [^;]+;)', f'\\1\n\nimport com.blog.modules.system.config.model.dto.{dto};', content)
            
            # 9. 修复RoleApi实体导入
            if 'RoleApi' in content and 'import com.blog.modules.system.api.model.entity.RoleApi;' not in content:
                content = re.sub(r'(package [^;]+;)', r'\1\n\nimport com.blog.modules.system.api.model.entity.RoleApi;', content)
            
            if content != original_content:
                with open(java_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[FIXED] {java_file.relative_to(base_path)}")
                fixed_count += 1
                
        except Exception as e:
            print(f"[ERROR] {java_file.relative_to(base_path)} - {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    fix_all_remaining_issues()
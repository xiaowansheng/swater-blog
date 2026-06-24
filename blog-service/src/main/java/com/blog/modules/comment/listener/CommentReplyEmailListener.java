package com.blog.modules.comment.listener;

import com.blog.infrastructure.mail.EmailService;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.system.config.service.SiteConfigService;
import com.blog.modules.system.config.model.dto.config.NotifyConfigDTO;
import com.blog.modules.talk.mapper.TalkMapper;
import com.blog.modules.talk.model.entity.Talk;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
public class CommentReplyEmailListener {

    @Autowired(required = false)
    private EmailService emailService;

    @Autowired(required = false)
    private CommentMapper commentMapper;

    @Autowired(required = false)
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private TalkMapper talkMapper;

    @Autowired
    private SiteConfigService siteConfigService;

    @Value("${blog.site-url:http://localhost:3001}")
    private String siteUrl;

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentReplyEmail(CommentCreatedEvent event) {
        try {
            if (emailService == null || !emailService.isConfigured()) {
                return;
            }

            NotifyConfigDTO notifyConfig = siteConfigService.getNotifyConfig();
            boolean replyEnabled = notifyConfig != null
                    && notifyConfig.getReplyNotify() != null
                    && notifyConfig.getReplyNotify();
            if (!replyEnabled) {
                return;
            }

            Comment comment = event.getComment();
            Long parentId = comment.getParentId();
            if (parentId == null || parentId <= 0 || commentMapper == null) {
                return;
            }

            Comment parentComment = commentMapper.selectById(parentId);
            if (parentComment == null || !StringUtils.hasText(parentComment.getEmail())) {
                return;
            }

            if (parentComment.getEmail().equals(comment.getEmail())) {
                return;
            }

            String replyNickname = StringUtils.hasText(comment.getNickname())
                    ? comment.getNickname() : "匿名用户";
            String title = replyNickname + " 回复了你的评论";
            String targetTitle = getTargetTitle(comment);
            String targetUrl = buildTargetUrl(comment, targetTitle);
            String content = buildEmailContent(replyNickname, comment.getContent(),
                    targetTitle, targetUrl, parentComment.getContent());

            emailService.sendEmail(parentComment.getEmail(), title, content);
            log.info("评论回复邮件已发送: to={}, from={}", parentComment.getEmail(), comment.getEmail());
        } catch (Exception e) {
            log.error("发送评论回复邮件失败, commentId={}", event.getCommentId(), e);
        }
    }

    private String getTargetTitle(Comment comment) {
        try {
            if ("ARTICLE".equals(comment.getTargetType()) && articleMapper != null) {
                Article article = articleMapper.selectById(comment.getTargetId());
                return article != null ? article.getTitle() : null;
            }
            if ("TALK".equals(comment.getTargetType()) && talkMapper != null) {
                Talk talk = talkMapper.selectById(comment.getTargetId());
                return talk != null ? talk.getContent() : null;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private String buildTargetUrl(Comment comment, String targetTitle) {
        if (targetTitle == null) {
            return null;
        }
        if ("ARTICLE".equals(comment.getTargetType())) {
            return siteUrl + "/post/" + comment.getTargetId() + "#anime-comment";
        }
        if ("TALK".equals(comment.getTargetType())) {
            try {
                if (talkMapper != null) {
                    Talk talk = talkMapper.selectById(comment.getTargetId());
                    if (talk != null && StringUtils.hasText(talk.getTalkKey())) {
                        return siteUrl + "/moment/" + talk.getTalkKey() + "#anime-comment";
                    }
                }
            } catch (Exception ignored) {
            }
            return siteUrl + "/moment/" + comment.getTargetId() + "#anime-comment";
        }
        return siteUrl + "/post/" + comment.getTargetId() + "#anime-comment";
    }

    private String buildEmailContent(String replyNickname, String replyContent,
                                      String targetTitle, String targetUrl, String parentContent) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        sb.append("<h2 style='color: #333;'>💬 收到新回复</h2>");
        sb.append("<p style='color: #666;'><b>").append(replyNickname).append("</b> 回复了你的评论：</p>");

        sb.append("<div style='background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 12px 0;'>");
        sb.append("<p style='color: #999; font-size: 12px; margin: 0 0 8px 0;'>你的评论：</p>");
        String safeParent = parentContent != null ? parentContent : "";
        if (safeParent.length() > 200) {
            safeParent = safeParent.substring(0, 200) + "...";
        }
        sb.append("<p style='color: #555; margin: 0;'>").append(escapeHtml(safeParent)).append("</p>");
        sb.append("</div>");

        sb.append("<div style='background: #e3f2fd; padding: 16px; border-radius: 8px; margin: 12px 0;'>");
        sb.append("<p style='color: #1976d2; font-size: 12px; margin: 0 0 8px 0;'>").append(replyNickname).append(" 的回复：</p>");
        sb.append("<p style='color: #333; margin: 0;'>").append(escapeHtml(replyContent)).append("</p>");
        sb.append("</div>");

        if (targetUrl != null) {
            sb.append("<a href='").append(targetUrl)
                    .append("' style='display: inline-block; padding: 10px 24px; background: #1976d2; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 12px;'>查看详情</a>");
        }

        sb.append("<hr style='margin: 24px 0; border: none; border-top: 1px solid #e0e0e0;' />");
        sb.append("<p style='color: #999; font-size: 12px;'>此邮件由系统自动发送，请勿回复。</p>");
        sb.append("</div>");
        return sb.toString();
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}

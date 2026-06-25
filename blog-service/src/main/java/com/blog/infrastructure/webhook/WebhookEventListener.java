package com.blog.infrastructure.webhook;

import com.blog.infrastructure.webhook.WebhookService;
import com.blog.modules.article.event.ArticlePublishedEvent;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.comment.event.CommentApprovedEvent;
import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.system.config.service.SiteConfigService;
import com.blog.modules.system.config.model.dto.config.WebhookConfigDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
public class WebhookEventListener {

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private SiteConfigService siteConfigService;

    @Value("${blog.site-url:http://localhost:3001}")
    private String siteUrl;

    @Async("eventTaskExecutor")
    @EventListener
    public void onArticlePublished(ArticlePublishedEvent event) {
        dispatch("article.published", buildArticlePayload(event.getArticle()));
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void onCommentApproved(CommentApprovedEvent event) {
        dispatch("comment.approved", buildCommentPayload(event.getComment()));
    }

    @Async("eventTaskExecutor")
    @EventListener
    public void onCommentCreated(CommentCreatedEvent event) {
        Comment comment = event.getComment();
        if (comment.getParentId() == null || comment.getParentId() <= 0) {
            dispatch("comment.created", buildCommentPayload(comment));
        } else {
            dispatch("comment.replied", buildCommentPayload(comment));
        }
    }

    private void dispatch(String event, Map<String, Object> payload) {
        try {
            WebhookConfigDTO config = siteConfigService.getWebhookConfig();
            if (config == null || config.getWebhooks() == null) return;

            for (WebhookConfigDTO.WebhookItem wh : config.getWebhooks()) {
                if (!wh.isEnabled() || !wh.getEvents().contains(event)) continue;
                webhookService.send(wh.getUrl(), wh.getSecret(), event, payload);
            }
        } catch (Exception e) {
            log.error("Webhook 分发失败: event={}", event, e);
        }
    }

    private Map<String, Object> buildArticlePayload(Article article) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", article.getId());
        data.put("title", article.getTitle());
        data.put("slug", article.getArticleKey());
        data.put("excerpt", article.getExcerpt());
        data.put("cover", article.getCover());
        data.put("categoryId", article.getCategoryId());
        data.put("status", article.getStatus());
        data.put("viewCount", article.getViewCount());
        data.put("likeCount", article.getLikeCount());
        data.put("commentCount", article.getCommentCount());
        data.put("url", siteUrl + "/post/" + article.getArticleKey());
        if (article.getPublishedAt() != null) {
            data.put("publishedAt", article.getPublishedAt().toString());
        }
        return data;
    }

    private Map<String, Object> buildCommentPayload(Comment comment) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", comment.getId());
        data.put("content", comment.getContent());
        data.put("nickname", comment.getNickname());
        data.put("targetId", comment.getTargetId());
        data.put("targetType", comment.getTargetType());
        data.put("parentId", comment.getParentId());
        data.put("location", comment.getLocation());
        if (comment.getCreateTime() != null) {
            data.put("createTime", comment.getCreateTime().toString());
        }
        return data;
    }
}

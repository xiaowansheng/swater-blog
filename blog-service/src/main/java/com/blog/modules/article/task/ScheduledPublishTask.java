package com.blog.modules.article.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.article.model.entity.Article;
import com.blog.modules.article.model.enums.ArticleStatus;
import com.blog.modules.article.service.ArticleCommandService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@ConditionalOnProperty(name = "blog.scheduler.publish.enabled", havingValue = "true", matchIfMissing = true)
public class ScheduledPublishTask {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleCommandService articleCommandService;

    @Scheduled(fixedDelay = 60000)
    public void publishScheduledArticles() {
        try {
            List<Article> scheduled = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                    .eq(Article::getStatus, ArticleStatus.SCHEDULED.getCode())
                    .le(Article::getPublishedAt, LocalDateTime.now())
                    .eq(Article::getDeleted, 0));
            if (scheduled.isEmpty()) {
                return;
            }
            for (Article article : scheduled) {
                try {
                    articleCommandService.publish(article.getId());
                    log.info("定时发布文章成功, id={}, title={}", article.getId(), article.getTitle());
                } catch (Exception e) {
                    log.error("定时发布文章失败, id={}", article.getId(), e);
                }
            }
        } catch (Exception e) {
            log.error("检查定时发布文章失败", e);
        }
    }
}

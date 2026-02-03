package com.blog.modules.statistics.track.service.impl;

import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.statistics.track.mapper.ContentMetricEventMapper;
import com.blog.modules.statistics.track.model.entity.ContentMetricEvent;
import com.blog.modules.talk.mapper.TalkMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class TrackAsyncMetricService {
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 50L;

    @Autowired(required = false)
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private TalkMapper talkMapper;

    @Autowired
    private ContentMetricEventMapper contentMetricEventMapper;

    @Async("eventTaskExecutor")
    public void onContentReadCounted(Long visitorId, String contentType, Long contentId, LocalDateTime now) {
        if (contentType == null || contentType.isBlank() || contentId == null) {
            log.warn("Skip metric handling due to invalid input: type={}, id={}", contentType, contentId);
            return;
        }
        boolean incremented = incrementContentViewCount(contentType, contentId);
        boolean recorded = recordMetricEvent(visitorId, "READ", contentType, contentId, 1, now);
        if (!incremented || !recorded) {
            log.error("Partial metric processing failure: incremented={}, recorded={}, type={}, id={}",
                    incremented, recorded, contentType, contentId);
        }
    }

    private boolean incrementContentViewCount(String contentType, Long contentId) {
        return executeWithRetry("increment_view_count", () -> {
            if ("ARTICLE".equals(contentType) && articleMapper != null) {
                articleMapper.incrementViewCount(contentId);
                return true;
            }
            if ("TALK".equals(contentType) && talkMapper != null) {
                talkMapper.incrementViewCount(contentId);
                return true;
            }
            log.warn("Skip increment because mapper unavailable or contentType unsupported: type={}, id={}",
                    contentType, contentId);
            return false;
        });
    }

    private boolean recordMetricEvent(Long visitorId, String metric, String contentType, Long contentId, int delta, LocalDateTime now) {
        return executeWithRetry("record_metric_event", () -> {
            ContentMetricEvent event = new ContentMetricEvent();
            event.setVisitorId(visitorId);
            event.setMetric(metric);
            event.setContentType(contentType);
            event.setContentId(contentId);
            event.setDelta(delta);
            event.setOccurredAt(now);
            contentMetricEventMapper.insert(event);
            return true;
        });
    }

    private boolean executeWithRetry(String action, RetryableAction task) {
        Exception lastError = null;
        for (int i = 1; i <= MAX_RETRIES; i++) {
            try {
                return task.run();
            } catch (Exception e) {
                lastError = e;
                if (i < MAX_RETRIES) {
                    log.warn("Retry {}/{} for action={}", i, MAX_RETRIES, action, e);
                    try {
                        Thread.sleep(RETRY_DELAY_MS);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        log.error("Failed action after retries: action={}", action, lastError);
        return false;
    }

    @FunctionalInterface
    private interface RetryableAction {
        boolean run();
    }
}

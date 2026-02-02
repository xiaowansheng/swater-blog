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
    @Autowired(required = false)
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private TalkMapper talkMapper;

    @Autowired
    private ContentMetricEventMapper contentMetricEventMapper;

    @Async("eventTaskExecutor")
    public void onContentReadCounted(Long visitorId, String contentType, Long contentId, LocalDateTime now) {
        incrementContentViewCount(contentType, contentId);
        recordMetricEvent(visitorId, "READ", contentType, contentId, 1, now);
    }

    private void incrementContentViewCount(String contentType, Long contentId) {
        try {
            if ("ARTICLE".equals(contentType) && articleMapper != null) {
                articleMapper.incrementViewCount(contentId);
                return;
            }
            if ("TALK".equals(contentType) && talkMapper != null) {
                talkMapper.incrementViewCount(contentId);
            }
        } catch (Exception e) {
            log.warn("Failed to increment view count: type={}, id={}", contentType, contentId, e);
        }
    }

    private void recordMetricEvent(Long visitorId, String metric, String contentType, Long contentId, int delta, LocalDateTime now) {
        try {
            ContentMetricEvent event = new ContentMetricEvent();
            event.setVisitorId(visitorId);
            event.setMetric(metric);
            event.setContentType(contentType);
            event.setContentId(contentId);
            event.setDelta(delta);
            event.setOccurredAt(now);
            contentMetricEventMapper.insert(event);
        } catch (Exception e) {
            log.warn("Failed to record metric event: metric={}, type={}, id={}", metric, contentType, contentId, e);
        }
    }
}

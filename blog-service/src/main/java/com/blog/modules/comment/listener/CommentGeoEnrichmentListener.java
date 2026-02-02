package com.blog.modules.comment.listener;

import com.blog.modules.comment.event.CommentCreatedEvent;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Component
public class CommentGeoEnrichmentListener {
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Autowired
    private CommentMapper commentMapper;

    @Async("eventTaskExecutor")
    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        if (locationProviderFactory == null || event == null || event.getComment() == null) {
            return;
        }

        Comment comment = event.getComment();
        if (!StringUtils.hasText(comment.getIp()) || comment.getId() == null) {
            return;
        }
        // 已有定位信息不重复处理
        if (StringUtils.hasText(comment.getCountry()) || StringUtils.hasText(comment.getLocation())) {
            return;
        }

        try {
            List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
            if (providers == null || providers.isEmpty()) {
                return;
            }

            LocationInfo locationInfo = null;
            for (LocationProviderPlugin provider : providers) {
                locationInfo = provider.getLocationInfo(comment.getIp());
                if (locationInfo != null) {
                    break;
                }
            }
            if (locationInfo == null) {
                return;
            }

            Comment update = new Comment();
            update.setId(comment.getId());
            update.setCountry(locationInfo.getCountry());
            update.setProvince(locationInfo.getProvince());
            update.setCity(locationInfo.getCity());
            update.setLatitude(locationInfo.getLatitude());
            update.setLongitude(locationInfo.getLongitude());
            update.setLocation(locationInfo.getLocation());
            update.setIpLocation(locationInfo.getIpLocation());
            if (StringUtils.hasText(locationInfo.getIp())) {
                update.setIp(locationInfo.getIp());
            }

            commentMapper.updateById(update);
        } catch (Exception e) {
            log.warn("评论IP定位异步处理失败，commentId={}", comment.getId(), e);
        }
    }
}

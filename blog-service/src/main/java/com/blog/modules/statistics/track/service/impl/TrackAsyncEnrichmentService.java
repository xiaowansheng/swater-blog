package com.blog.modules.statistics.track.service.impl;

import com.blog.modules.statistics.visitor.mapper.VisitorMapper;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
public class TrackAsyncEnrichmentService {
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Autowired
    private VisitorMapper visitorMapper;

    @Async("eventTaskExecutor")
    public void enrichVisitorLocation(Long visitorId, String ip) {
        if (visitorId == null || !StringUtils.hasText(ip) || locationProviderFactory == null) {
            return;
        }
        try {
            List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
            if (providers == null || providers.isEmpty()) {
                return;
            }

            LocationInfo locationInfo = null;
            for (LocationProviderPlugin provider : providers) {
                locationInfo = provider.getLocationInfo(ip);
                if (locationInfo != null) {
                    break;
                }
            }
            if (locationInfo == null) {
                return;
            }

            Visitor update = new Visitor();
            update.setId(visitorId);
            update.setCountry(locationInfo.getCountry());
            update.setProvince(locationInfo.getProvince());
            update.setCity(locationInfo.getCity());
            update.setDistrict(locationInfo.getDistrict());
            update.setLatitude(locationInfo.getLatitude());
            update.setLongitude(locationInfo.getLongitude());
            update.setLocation(locationInfo.getLocation());
            update.setIsp(locationInfo.getIsp());
            update.setTimezone(locationInfo.getTimezone());
            if (StringUtils.hasText(locationInfo.getIp())) {
                update.setIp(locationInfo.getIp());
            }
            visitorMapper.updateById(update);
        } catch (Exception e) {
            log.warn("访客IP定位异步处理失败，visitorId={}", visitorId, e);
        }
    }
}

package com.blog.modules.statistics.track.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.article.mapper.ArticleMapper;
import com.blog.modules.statistics.track.mapper.ContentReadMapper;
import com.blog.modules.statistics.track.mapper.ContentMetricEventMapper;
import com.blog.modules.statistics.track.mapper.PageViewMapper;
import com.blog.modules.statistics.track.mapper.VisitorSessionMapper;
import com.blog.modules.statistics.track.model.dto.TrackEnterDTO;
import com.blog.modules.statistics.track.model.entity.ContentRead;
import com.blog.modules.statistics.track.model.entity.ContentMetricEvent;
import com.blog.modules.statistics.track.model.entity.PageView;
import com.blog.modules.statistics.track.model.entity.VisitorSession;
import com.blog.modules.statistics.track.model.vo.TrackEnterResultVO;
import com.blog.modules.statistics.track.service.TrackService;
import com.blog.modules.statistics.visitor.mapper.VisitorMapper;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import com.blog.modules.statistics.visitor.util.VisitorUserAgentInfo;
import com.blog.modules.statistics.visitor.util.VisitorUserAgentParser;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import com.blog.shared.util.RequestUtil;
import com.blog.modules.talk.mapper.TalkMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class TrackServiceImpl implements TrackService {
    private static final int SESSION_TIMEOUT_MINUTES = 30;

    @Autowired
    private VisitorMapper visitorMapper;

    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Autowired
    private VisitorSessionMapper visitorSessionMapper;

    @Autowired
    private PageViewMapper pageViewMapper;

    @Autowired
    private ContentReadMapper contentReadMapper;

    @Autowired
    private ContentMetricEventMapper contentMetricEventMapper;

    @Autowired(required = false)
    private ArticleMapper articleMapper;

    @Autowired(required = false)
    private TalkMapper talkMapper;

    @Override
    @Transactional
    public TrackEnterResultVO enter(TrackEnterDTO dto, HttpServletRequest request) {
        TrackEnterDTO safeDto = dto != null ? dto : new TrackEnterDTO();
        LocalDateTime now = LocalDateTime.now();

        String ip = RequestUtil.getClientIp(request);
        String userAgent = RequestUtil.getUserAgent(request);

        TrackEnterResultVO result = new TrackEnterResultVO();

        VisitorResolveResult visitorResolveResult = resolveVisitor(safeDto, ip, userAgent, now);
        result.setVisitorUuid(visitorResolveResult.visitor.getVisitorUuid());
        result.setNewVisitor(visitorResolveResult.newVisitor);

        SessionResolveResult sessionResolveResult = resolveSession(visitorResolveResult.visitor.getId(), safeDto, now);
        result.setSessionId(sessionResolveResult.session.getSessionId());
        result.setNewSession(sessionResolveResult.newSession);

        result.setPagePvCounted(recordPageView(visitorResolveResult.visitor.getId(), sessionResolveResult.session.getSessionId(), safeDto, now));
        result.setContentReadCounted(recordContentRead(visitorResolveResult.visitor.getId(), safeDto, now));
        return result;
    }

    private VisitorResolveResult resolveVisitor(TrackEnterDTO dto, String ip, String userAgent, LocalDateTime now) {
        String visitorUuid = StringUtils.hasText(dto.getVisitorUuid()) ? dto.getVisitorUuid() : UUID.randomUUID().toString();
        Visitor visitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                .eq(Visitor::getVisitorUuid, visitorUuid)
                .last("LIMIT 1"));

        boolean isNewVisitor = false;
        boolean within24h = false;
        if (visitor == null) {
            isNewVisitor = true;
            visitor = new Visitor();
            visitor.setVisitorUuid(visitorUuid);
            visitor.setFirstVisitTime(now);
            visitor.setVisitCount(1);
            visitor.setStatus("ACTIVE");
        } else {
            within24h = visitor.getLastVisitTime() != null
                    && !visitor.getLastVisitTime().isBefore(now.minusHours(24));
            if (!within24h) {
                visitor.setVisitCount((visitor.getVisitCount() != null ? visitor.getVisitCount() : 0) + 1);
            }
        }

        visitor.setLastVisitTime(now);
        applyLocation(visitor, ip);

        VisitorUserAgentInfo uaInfo = VisitorUserAgentParser.parse(userAgent);
        if (uaInfo != null) {
            visitor.setDeviceType(uaInfo.getDeviceType());
            visitor.setDeviceBrand(uaInfo.getDeviceBrand());
            visitor.setDeviceModel(uaInfo.getDeviceModel());
            visitor.setBrowserName(uaInfo.getBrowserName());
            visitor.setBrowserVersion(uaInfo.getBrowserVersion());
            visitor.setOsName(uaInfo.getOsName());
            visitor.setOsVersion(uaInfo.getOsVersion());
        }

        populateTraffic(visitor, dto.getReferer(), dto.getUtmSource(), dto.getUtmMedium(), dto.getUtmCampaign());

        if (isNewVisitor) {
            visitorMapper.insert(visitor);
        } else {
            visitorMapper.updateById(visitor);
        }

        return new VisitorResolveResult(visitor, isNewVisitor);
    }

    private void applyLocation(Visitor visitor, String ip) {
        if (!StringUtils.hasText(ip)) {
            if (!StringUtils.hasText(visitor.getIp())) {
                visitor.setIp("UNKNOWN");
            }
            return;
        }

        if (locationProviderFactory == null) {
            visitor.setIp(ip);
            return;
        }

        try {
            List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
            LocationInfo locationInfo = null;
            for (LocationProviderPlugin locationProvider : providers) {
                locationInfo = locationProvider.getLocationInfo(ip);
                if (locationInfo != null) {
                    break;
                }
            }

            if (locationInfo != null) {
                visitor.setCountry(firstNonBlank(locationInfo.getCountry(), visitor.getCountry()));
                visitor.setProvince(firstNonBlank(locationInfo.getProvince(), visitor.getProvince()));
                visitor.setCity(firstNonBlank(locationInfo.getCity(), visitor.getCity()));
                visitor.setDistrict(firstNonBlank(locationInfo.getDistrict(), visitor.getDistrict()));
                visitor.setLatitude(locationInfo.getLatitude());
                visitor.setLongitude(locationInfo.getLongitude());
                visitor.setLocation(firstNonBlank(locationInfo.getLocation(), visitor.getLocation()));
                visitor.setIsp(firstNonBlank(locationInfo.getIsp(), visitor.getIsp()));
                visitor.setTimezone(firstNonBlank(locationInfo.getTimezone(), visitor.getTimezone()));
                visitor.setIp(firstNonBlank(locationInfo.getIp(), ip));
            } else {
                visitor.setIp(ip);
            }
        } catch (Exception e) {
            log.warn("IP定位失败，IP: {}", ip, e);
            visitor.setIp(ip);
        }
    }

    private void populateTraffic(Visitor visitor, String referer, String utmSource, String utmMedium, String utmCampaign) {
        visitor.setRefererUrl(firstNonBlank(referer, visitor.getRefererUrl()));
        visitor.setUtmSource(firstNonBlank(utmSource, visitor.getUtmSource()));
        visitor.setUtmMedium(firstNonBlank(utmMedium, visitor.getUtmMedium()));
        visitor.setUtmCampaign(firstNonBlank(utmCampaign, visitor.getUtmCampaign()));

        if (StringUtils.hasText(utmSource)) {
            visitor.setTrafficSource("UTM");
            return;
        }
        if (!StringUtils.hasText(referer)) {
            visitor.setTrafficSource("DIRECT");
            return;
        }
        String lower = referer.toLowerCase();
        if (lower.contains("google.") || lower.contains("bing.") || lower.contains("baidu.") || lower.contains("yahoo.")) {
            visitor.setTrafficSource("SEARCH");
            visitor.setSearchEngine(resolveSearchEngine(referer));
            visitor.setSearchKeywords(extractQueryParam(referer, "q"));
        } else {
            visitor.setTrafficSource("REFERRAL");
        }
    }

    private String resolveSearchEngine(String referer) {
        if (!StringUtils.hasText(referer)) {
            return null;
        }
        String lower = referer.toLowerCase();
        if (lower.contains("google.")) {
            return "Google";
        }
        if (lower.contains("bing.")) {
            return "Bing";
        }
        if (lower.contains("baidu.")) {
            return "Baidu";
        }
        if (lower.contains("yahoo.")) {
            return "Yahoo";
        }
        return null;
    }

    private String extractQueryParam(String url, String param) {
        if (!StringUtils.hasText(url) || !StringUtils.hasText(param)) {
            return null;
        }
        int queryStart = url.indexOf("?");
        if (queryStart < 0 || queryStart == url.length() - 1) {
            return null;
        }
        String query = url.substring(queryStart + 1);
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2 && param.equalsIgnoreCase(kv[0])) {
                return kv[1];
            }
        }
        return null;
    }

    private String firstNonBlank(String candidate, String fallback) {
        return StringUtils.hasText(candidate) ? candidate : fallback;
    }

    private SessionResolveResult resolveSession(Long visitorId, TrackEnterDTO dto, LocalDateTime now) {
        VisitorSession lastSession = visitorSessionMapper.selectOne(new LambdaQueryWrapper<VisitorSession>()
                .eq(VisitorSession::getVisitorId, visitorId)
                .eq(VisitorSession::getDeleted, 0)
                .orderByDesc(VisitorSession::getLastActivityAt)
                .last("LIMIT 1"));

        boolean newSession = false;
        VisitorSession session;
        if (lastSession == null || lastSession.getLastActivityAt() == null
                || lastSession.getLastActivityAt().isBefore(now.minusMinutes(SESSION_TIMEOUT_MINUTES))) {
            newSession = true;
            session = new VisitorSession();
            session.setVisitorId(visitorId);
            session.setSessionId(UUID.randomUUID().toString());
            session.setStartedAt(now);
            session.setLastActivityAt(now);
            session.setEntryPageKey(dto.getPageKey());
            session.setEntryReferer(dto.getReferer());
            session.setUtmSource(dto.getUtmSource());
            session.setUtmMedium(dto.getUtmMedium());
            session.setUtmCampaign(dto.getUtmCampaign());
            visitorSessionMapper.insert(session);
        } else {
            session = lastSession;
            session.setLastActivityAt(now);
            visitorSessionMapper.updateById(session);
        }

        return new SessionResolveResult(session, newSession);
    }

    private boolean recordPageView(Long visitorId, String sessionId, TrackEnterDTO dto, LocalDateTime now) {
        if (!StringUtils.hasText(dto.getPageKey())) {
            return false;
        }
        PageView pv = new PageView();
        pv.setVisitorId(visitorId);
        pv.setSessionId(sessionId);
        pv.setPageKey(dto.getPageKey());
        pv.setPageUrl(dto.getPageUrl());
        pv.setReferer(dto.getReferer());
        pv.setOccurredAt(now);

        try {
            pageViewMapper.insert(pv);
            return true;
        } catch (DuplicateKeyException e) {
            return false;
        }
    }

    private boolean recordContentRead(Long visitorId, TrackEnterDTO dto, LocalDateTime now) {
        if (!StringUtils.hasText(dto.getContentType()) || dto.getContentId() == null) {
            return false;
        }
        String contentType = dto.getContentType().trim().toUpperCase();
        if (!"ARTICLE".equals(contentType) && !"TALK".equals(contentType)) {
            return false;
        }

        ContentRead existing = contentReadMapper.selectOne(new LambdaQueryWrapper<ContentRead>()
                .eq(ContentRead::getVisitorId, visitorId)
                .eq(ContentRead::getContentType, contentType)
                .eq(ContentRead::getContentId, dto.getContentId())
                .eq(ContentRead::getDeleted, 0)
                .last("LIMIT 1"));

        boolean counted;
        if (existing == null) {
            try {
                ContentRead row = new ContentRead();
                row.setVisitorId(visitorId);
                row.setContentType(contentType);
                row.setContentId(dto.getContentId());
                row.setLastCountedAt(now);
                contentReadMapper.insert(row);
                counted = true;
            } catch (DuplicateKeyException e) {
                ContentRead raced = contentReadMapper.selectOne(new LambdaQueryWrapper<ContentRead>()
                        .eq(ContentRead::getVisitorId, visitorId)
                        .eq(ContentRead::getContentType, contentType)
                        .eq(ContentRead::getContentId, dto.getContentId())
                        .eq(ContentRead::getDeleted, 0)
                        .last("LIMIT 1"));
                counted = raced == null || raced.getLastCountedAt() == null || raced.getLastCountedAt().isBefore(now.minusHours(24));
                if (counted && raced != null) {
                    raced.setLastCountedAt(now);
                    contentReadMapper.updateById(raced);
                }
            }
        } else if (existing.getLastCountedAt() == null || existing.getLastCountedAt().isBefore(now.minusHours(24))) {
            existing.setLastCountedAt(now);
            contentReadMapper.updateById(existing);
            counted = true;
        } else {
            counted = false;
        }

        if (counted) {
            incrementContentViewCount(contentType, dto.getContentId());
            recordMetricEvent(visitorId, "READ", contentType, dto.getContentId(), 1, now);
        }
        return counted;
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

    private record VisitorResolveResult(Visitor visitor, boolean newVisitor) {
    }

    private record SessionResolveResult(VisitorSession session, boolean newSession) {
    }
}

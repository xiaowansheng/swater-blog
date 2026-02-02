package com.blog.modules.statistics.track.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.blog.modules.statistics.track.mapper.ContentReadMapper;
import com.blog.modules.statistics.track.mapper.PageViewMapper;
import com.blog.modules.statistics.track.mapper.VisitorSessionMapper;
import com.blog.modules.statistics.track.model.dto.TrackEnterDTO;
import com.blog.modules.statistics.track.model.entity.VisitorSession;
import com.blog.modules.statistics.track.model.vo.TrackEnterResultVO;
import com.blog.modules.statistics.track.service.TrackService;
import com.blog.modules.statistics.visitor.mapper.VisitorMapper;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.RequestUtil;
import com.blog.shared.util.UserAgentUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
public class TrackServiceImpl implements TrackService {
    private static final int SESSION_TIMEOUT_MINUTES = 30;

    @Autowired
    private VisitorMapper visitorMapper;

    @Autowired
    private TrackAsyncEnrichmentService trackAsyncEnrichmentService;

    @Autowired
    private VisitorSessionMapper visitorSessionMapper;

    @Autowired
    private PageViewMapper pageViewMapper;

    @Autowired
    private ContentReadMapper contentReadMapper;

    @Autowired
    private TrackAsyncMetricService trackAsyncMetricService;

    @Override
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
        Visitor existingVisitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                .select(Visitor::getId, Visitor::getVisitorUuid, Visitor::getDeleted)
                .eq(Visitor::getVisitorUuid, visitorUuid)
                .last("LIMIT 1"));

        Visitor visitor = new Visitor();
        visitor.setVisitorUuid(visitorUuid);
        visitor.setIp(StringUtils.hasText(ip) ? ip : "UNKNOWN");
        visitor.setStatus("ACTIVE");

        UserAgentInfo uaInfo = UserAgentUtil.parse(userAgent);
        visitor.setDeviceType(uaInfo.getDeviceType());
        visitor.setDeviceBrand(uaInfo.getDeviceBrand());
        visitor.setDeviceModel(uaInfo.getDeviceModel());
        visitor.setBrowserName(uaInfo.getBrowserName());
        visitor.setBrowserVersion(uaInfo.getBrowserVersion());
        visitor.setOsName(uaInfo.getOsName());
        visitor.setOsVersion(uaInfo.getOsVersion());

        populateTraffic(visitor, dto.getReferer(), dto.getUtmSource(), dto.getUtmMedium(), dto.getUtmCampaign());

        visitorMapper.upsertVisitorHeartbeat(
                visitor.getVisitorUuid(),
                visitor.getIp(),
                visitor.getCountry(),
                visitor.getProvince(),
                visitor.getCity(),
                visitor.getDistrict(),
                visitor.getLatitude(),
                visitor.getLongitude(),
                visitor.getLocation(),
                visitor.getIsp(),
                visitor.getTimezone(),
                visitor.getDeviceType(),
                visitor.getDeviceBrand(),
                visitor.getDeviceModel(),
                visitor.getOsName(),
                visitor.getOsVersion(),
                visitor.getBrowserName(),
                visitor.getBrowserVersion(),
                visitor.getRefererUrl(),
                visitor.getTrafficSource(),
                visitor.getSearchEngine(),
                visitor.getSearchKeywords(),
                visitor.getUtmSource(),
                visitor.getUtmMedium(),
                visitor.getUtmCampaign(),
                now
        );

        boolean isNewVisitor = existingVisitor == null;
        Visitor persisted;
        if (existingVisitor != null && existingVisitor.getId() != null) {
            persisted = visitor;
            persisted.setId(existingVisitor.getId());
            trackAsyncEnrichmentService.enrichVisitorLocation(persisted.getId(), ip);
        } else {
            persisted = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                    .select(Visitor::getId, Visitor::getVisitorUuid)
                    .eq(Visitor::getVisitorUuid, visitorUuid)
                    .eq(Visitor::getDeleted, 0)
                    .last("LIMIT 1"));
            if (persisted == null) {
                persisted = visitor;
            } else {
                trackAsyncEnrichmentService.enrichVisitorLocation(persisted.getId(), ip);
            }
        }

        return new VisitorResolveResult(persisted, isNewVisitor);
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
                .select(
                        VisitorSession::getId,
                        VisitorSession::getVisitorId,
                        VisitorSession::getSessionId,
                        VisitorSession::getLastActivityAt
                )
                .eq(VisitorSession::getVisitorId, visitorId)
                .eq(VisitorSession::getDeleted, 0)
                .ge(VisitorSession::getLastActivityAt, now.minusMinutes(SESSION_TIMEOUT_MINUTES))
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
            visitorSessionMapper.update(
                    null,
                    new LambdaUpdateWrapper<VisitorSession>()
                            .eq(VisitorSession::getId, session.getId())
                            .set(VisitorSession::getLastActivityAt, now)
            );
            session.setLastActivityAt(now);
        }

        return new SessionResolveResult(session, newSession);
    }

    private boolean recordPageView(Long visitorId, String sessionId, TrackEnterDTO dto, LocalDateTime now) {
        if (!StringUtils.hasText(dto.getPageKey())) {
            return false;
        }
        int affected = pageViewMapper.insertIgnore(
                visitorId,
                sessionId,
                dto.getPageKey(),
                dto.getPageUrl(),
                dto.getReferer(),
                now,
                now
        );
        return affected > 0;
    }

    private boolean recordContentRead(Long visitorId, TrackEnterDTO dto, LocalDateTime now) {
        if (!StringUtils.hasText(dto.getContentType()) || dto.getContentId() == null) {
            return false;
        }
        String contentType = dto.getContentType().trim().toUpperCase();
        if (!"ARTICLE".equals(contentType) && !"TALK".equals(contentType)) {
            return false;
        }

        int affected = contentReadMapper.upsertReadAndTouch(visitorId, contentType, dto.getContentId(), now);
        boolean counted = affected > 0;

        if (counted) {
            trackAsyncMetricService.onContentReadCounted(visitorId, contentType, dto.getContentId(), now);
        }
        return counted;
    }

    private record VisitorResolveResult(Visitor visitor, boolean newVisitor) {
    }

    private record SessionResolveResult(VisitorSession session, boolean newSession) {
    }
}

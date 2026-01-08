package com.blog.modules.statistics.visitor.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.statistics.visitor.mapper.VisitorAccessLogMapper;
import com.blog.modules.statistics.visitor.mapper.VisitorMapper;
import com.blog.modules.statistics.visitor.model.dto.VisitorAccessDTO;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import com.blog.modules.statistics.visitor.model.entity.VisitorAccessLog;
import com.blog.modules.statistics.visitor.model.vo.VisitorStatisticsVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorAccessResultVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import com.blog.modules.statistics.visitor.util.VisitorUserAgentInfo;
import com.blog.modules.statistics.visitor.util.VisitorUserAgentParser;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderFactory;
import com.blog.plugin.components.location.LocationProviderPlugin;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
@Slf4j
@Service
public class VisitorServiceImpl implements VisitorService {
    @Autowired
    private VisitorMapper visitorMapper;

    @Autowired
    private VisitorAccessLogMapper visitorAccessLogMapper;
    
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Override
    @Transactional
    public VisitorAccessResultVO recordAccess(VisitorAccessDTO dto) {
        LocalDateTime now = LocalDateTime.now();
        VisitorAccessResultVO result = new VisitorAccessResultVO();
        VisitorUserAgentInfo uaInfo = VisitorUserAgentParser.parse(dto.getUserAgent());
        populateDeviceInfo(dto, uaInfo);
        populateTraffic(dto);

        Visitor visitor = findExistingVisitor(dto, uaInfo);
        boolean isNewVisitor = visitor == null;
        boolean within24h = false;

        if (visitor == null) {
            visitor = new Visitor();
            visitor.setVisitorUuid(resolveVisitorUuid(dto.getVisitorUuid()));
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
        mergeVisitor(visitor, dto);
        applyLocation(visitor, dto.getIp());

        if (visitor.getId() == null) {
            visitorMapper.insert(visitor);
        } else {
            visitorMapper.updateById(visitor);
        }

        boolean logSkipped = false;
        if (!shouldSkipLog(visitor.getId(), now)) {
            VisitorAccessLog log = new VisitorAccessLog();
            log.setVisitorId(visitor.getId());
            log.setVisitorUuid(visitor.getVisitorUuid());
            log.setIp(dto.getIp());
            log.setPageType(dto.getPageType());
            log.setPageId(dto.getPageId());
            log.setPageUrl(dto.getPageUrl());
            log.setSessionId(dto.getSessionId());
            log.setIsNewVisitor(isNewVisitor && !within24h ? 1 : 0);
            log.setAccessTime(now);
            log.setTrafficSource(StringUtils.hasText(dto.getTrafficSource()) ? dto.getTrafficSource() : "UNKNOWN");
            log.setRefererUrl(dto.getReferer());
            log.setSearchEngine(dto.getSearchEngine());
            log.setSearchKeywords(dto.getSearchKeywords());
            log.setUtmSource(dto.getUtmSource());
            log.setUtmMedium(dto.getUtmMedium());
            log.setUtmCampaign(dto.getUtmCampaign());
            visitorAccessLogMapper.insert(log);
        } else {
            logSkipped = true;
        }

        result.setVisitorUuid(visitor.getVisitorUuid());
        result.setNewVisitor(isNewVisitor && !within24h);
        result.setSkipped(logSkipped);
        return result;
    }

    private void populateDeviceInfo(VisitorAccessDTO dto, VisitorUserAgentInfo uaInfo) {
        if (uaInfo == null) {
            return;
        }
        dto.setDeviceType(uaInfo.getDeviceType());
        dto.setDeviceBrand(uaInfo.getDeviceBrand());
        dto.setDeviceModel(uaInfo.getDeviceModel());
        dto.setOs(uaInfo.getOsName());
        dto.setOsVersion(uaInfo.getOsVersion());
        dto.setBrowser(uaInfo.getBrowserName());
        dto.setBrowserVersion(uaInfo.getBrowserVersion());
    }

    private void populateTraffic(VisitorAccessDTO dto) {
        if (StringUtils.hasText(dto.getUtmSource())) {
            dto.setTrafficSource("UTM");
            return;
        }
        String referer = dto.getReferer();
        if (!StringUtils.hasText(referer)) {
            dto.setTrafficSource("DIRECT");
            return;
        }
        String lower = referer.toLowerCase();
        if (lower.contains("google.") || lower.contains("bing.") || lower.contains("baidu.") || lower.contains("yahoo.")) {
            dto.setTrafficSource("SEARCH");
            dto.setSearchEngine(resolveSearchEngine(referer));
            dto.setSearchKeywords(extractQueryParam(referer, "q"));
        } else {
            dto.setTrafficSource("REFERRAL");
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

    private String resolveVisitorUuid(String requestUuid) {
        if (StringUtils.hasText(requestUuid)) {
            return requestUuid;
        }
        return UUID.randomUUID().toString().replace("-", "");
    }

    private Visitor findExistingVisitor(VisitorAccessDTO dto, VisitorUserAgentInfo uaInfo) {
        if (StringUtils.hasText(dto.getVisitorUuid())) {
            Visitor byUuid = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                    .eq(Visitor::getVisitorUuid, dto.getVisitorUuid()));
            if (byUuid != null) {
                return byUuid;
            }
        }

        LambdaQueryWrapper<Visitor> wrapper = new LambdaQueryWrapper<>();
        boolean hasCondition = false;
        if (StringUtils.hasText(dto.getIp())) {
            wrapper.eq(Visitor::getIp, dto.getIp());
            hasCondition = true;
        }
        if (uaInfo != null && StringUtils.hasText(uaInfo.getDeviceType())) {
            wrapper.eq(Visitor::getDeviceType, uaInfo.getDeviceType());
            hasCondition = true;
        }
        if (uaInfo != null && StringUtils.hasText(uaInfo.getOsName())) {
            wrapper.eq(Visitor::getOsName, uaInfo.getOsName());
            hasCondition = true;
        }
        if (uaInfo != null && StringUtils.hasText(uaInfo.getBrowserName())) {
            wrapper.eq(Visitor::getBrowserName, uaInfo.getBrowserName());
            hasCondition = true;
        }
        if (!hasCondition) {
            return null;
        }
        return visitorMapper.selectOne(wrapper.last("LIMIT 1"));
    }

    private void applyLocation(Visitor visitor, String ip) {
        if (!StringUtils.hasText(ip)) {
            return;
        }
        if (locationProviderFactory == null) {
            visitor.setIp(firstNonBlank(ip, visitor.getIp()));
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
                visitor.setIp(firstNonBlank(ip, visitor.getIp()));
            }
        } catch (Exception e) {
            log.warn("IP定位失败，IP: {}", ip, e);
            visitor.setIp(firstNonBlank(ip, visitor.getIp()));
        }
    }

    private void mergeVisitor(Visitor visitor, VisitorAccessDTO dto) {
        visitor.setDeviceType(firstNonBlank(dto.getDeviceType(), visitor.getDeviceType()));
        visitor.setDeviceBrand(firstNonBlank(dto.getDeviceBrand(), visitor.getDeviceBrand()));
        visitor.setDeviceModel(firstNonBlank(dto.getDeviceModel(), visitor.getDeviceModel()));
        visitor.setOsName(firstNonBlank(dto.getOs(), visitor.getOsName()));
        visitor.setOsVersion(firstNonBlank(dto.getOsVersion(), visitor.getOsVersion()));
        visitor.setBrowserName(firstNonBlank(dto.getBrowser(), visitor.getBrowserName()));
        visitor.setBrowserVersion(firstNonBlank(dto.getBrowserVersion(), visitor.getBrowserVersion()));
        visitor.setRefererUrl(firstNonBlank(dto.getReferer(), visitor.getRefererUrl()));
        visitor.setTrafficSource(firstNonBlank(dto.getTrafficSource(), visitor.getTrafficSource()));
        visitor.setSearchEngine(firstNonBlank(dto.getSearchEngine(), visitor.getSearchEngine()));
        visitor.setSearchKeywords(firstNonBlank(dto.getSearchKeywords(), visitor.getSearchKeywords()));
        visitor.setUtmSource(firstNonBlank(dto.getUtmSource(), visitor.getUtmSource()));
        visitor.setUtmMedium(firstNonBlank(dto.getUtmMedium(), visitor.getUtmMedium()));
        visitor.setUtmCampaign(firstNonBlank(dto.getUtmCampaign(), visitor.getUtmCampaign()));
        visitor.setIp(firstNonBlank(dto.getIp(), visitor.getIp()));
    }

    private boolean shouldSkipLog(Long visitorId, LocalDateTime now) {
        if (visitorId == null) {
            return false;
        }
        LambdaQueryWrapper<VisitorAccessLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(VisitorAccessLog::getVisitorId, visitorId)
                .orderByDesc(VisitorAccessLog::getAccessTime)
                .last("LIMIT 1");
        VisitorAccessLog lastLog = visitorAccessLogMapper.selectOne(wrapper);
        if (lastLog == null || lastLog.getAccessTime() == null) {
            return false;
        }
        return !lastLog.getAccessTime().isBefore(now.minusHours(1));
    }

    private String firstNonBlank(String candidate, String fallback) {
        if (StringUtils.hasText(candidate)) {
            return candidate;
        }
        return fallback;
    }

    @Override
    public PageResult<VisitorVO> list(Long page, Long size, String keyword) {
        Page<Visitor> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Visitor> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Visitor::getIp, keyword)
                    .or().like(Visitor::getCountry, keyword)
                    .or().like(Visitor::getCity, keyword)
                    .or().like(Visitor::getVisitorUuid, keyword));
        }
        wrapper.orderByDesc(Visitor::getLastVisitTime);
        
        Page<Visitor> result = visitorMapper.selectPage(pageParam, wrapper);
        List<VisitorVO> voList = result.getRecords().stream()
                .map(visitor -> BeanUtil.copyProperties(visitor, VisitorVO.class))
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public VisitorStatisticsVO getStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        VisitorStatisticsVO statistics = new VisitorStatisticsVO();
        
        LambdaQueryWrapper<Visitor> visitorWrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            visitorWrapper.ge(Visitor::getFirstVisitTime, startDate);
        }
        if (endDate != null) {
            visitorWrapper.le(Visitor::getFirstVisitTime, endDate);
        }
        statistics.setTotalVisitors(visitorMapper.selectCount(visitorWrapper).longValue());
        
        LambdaQueryWrapper<VisitorAccessLog> logWrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            logWrapper.ge(VisitorAccessLog::getAccessTime, startDate);
        }
        if (endDate != null) {
            logWrapper.le(VisitorAccessLog::getAccessTime, endDate);
        }
        statistics.setTotalPageViews(visitorAccessLogMapper.selectCount(logWrapper).longValue());
        
        logWrapper.eq(VisitorAccessLog::getIsNewVisitor, 1);
        statistics.setUniqueVisitors(visitorAccessLogMapper.selectCount(logWrapper).longValue());
        
        List<Visitor> visitors = visitorMapper.selectList(visitorWrapper);
        Map<String, Long> byDate = new HashMap<>();
        Map<String, Long> byCountry = new HashMap<>();
        Map<String, Long> byCity = new HashMap<>();
        Map<String, Long> byDevice = new HashMap<>();
        Map<String, Long> byBrowser = new HashMap<>();
        Map<String, Long> byOs = new HashMap<>();
        
        if (visitors != null && !visitors.isEmpty()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            for (Visitor visitor : visitors) {
                if (visitor.getFirstVisitTime() != null) {
                    String date = visitor.getFirstVisitTime().format(formatter);
                    byDate.put(date, byDate.getOrDefault(date, 0L) + 1);
                }
                if (visitor.getCountry() != null) {
                    byCountry.put(visitor.getCountry(), byCountry.getOrDefault(visitor.getCountry(), 0L) + 1);
                }
                if (visitor.getCity() != null) {
                    byCity.put(visitor.getCity(), byCity.getOrDefault(visitor.getCity(), 0L) + 1);
                }
                if (visitor.getDeviceType() != null) {
                    byDevice.put(visitor.getDeviceType(), byDevice.getOrDefault(visitor.getDeviceType(), 0L) + 1);
                }
                if (visitor.getBrowserName() != null) {
                    byBrowser.put(visitor.getBrowserName(), byBrowser.getOrDefault(visitor.getBrowserName(), 0L) + 1);
                }
                if (visitor.getOsName() != null) {
                    byOs.put(visitor.getOsName(), byOs.getOrDefault(visitor.getOsName(), 0L) + 1);
                }
            }
        }
        
        statistics.setVisitorsByDate(byDate);
        statistics.setVisitorsByCountry(byCountry);
        statistics.setVisitorsByCity(byCity);
        statistics.setVisitorsByDevice(byDevice);
        statistics.setVisitorsByBrowser(byBrowser);
        statistics.setVisitorsByOs(byOs);
        
        return statistics;
    }
}


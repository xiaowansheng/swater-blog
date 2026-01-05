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
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderFactory;
import com.blog.plugin.location.LocationProviderPlugin;
import com.blog.modules.statistics.visitor.service.VisitorService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
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
    public void recordAccess(VisitorAccessDTO dto) {
        LocalDateTime now = LocalDateTime.now();
        Visitor visitor = null;
        
        if (dto.getVisitorUuid() != null && !dto.getVisitorUuid().isEmpty()) {
            visitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                    .eq(Visitor::getVisitorUuid, dto.getVisitorUuid()));
        }
        
        if (visitor == null) {
            visitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                    .eq(Visitor::getIp, dto.getIp()));
        }
        
        boolean isNewVisitor = false;
        if (visitor == null) {
            isNewVisitor = true;
            visitor = new Visitor();
            visitor.setVisitorUuid(UUID.randomUUID().toString().replace("-", ""));
            visitor.setIp(dto.getIp());
            visitor.setFirstVisitTime(now);
            visitor.setVisitCount(1);
            visitor.setStatus("ACTIVE");
            
            if (locationProviderFactory != null) {
                try {
                    List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
                    LocationInfo locationInfo = null;
                    for (LocationProviderPlugin locationProvider : providers) {
                        locationInfo = locationProvider.getLocationInfo(dto.getIp());
                        if (locationInfo != null) {
                            break;
                        }
                    }
                    if (locationInfo != null) {
                        visitor.setCountry(locationInfo.getCountry());
                        visitor.setProvince(locationInfo.getProvince());
                        visitor.setCity(locationInfo.getCity());
                        visitor.setDistrict(locationInfo.getDistrict());
                        visitor.setLatitude(locationInfo.getLatitude());
                        visitor.setLongitude(locationInfo.getLongitude());
                        visitor.setLocation(locationInfo.getLocation());
                        visitor.setIsp(locationInfo.getIsp());
                        visitor.setTimezone(locationInfo.getTimezone());
                        if (locationInfo.getIp() != null && !locationInfo.getIp().isEmpty()) {
                            visitor.setIp(locationInfo.getIp());
                        } else {
                            visitor.setIp(dto.getIp());
                        }
                    } else {
                        visitor.setIp(dto.getIp());
                    }
                } catch (Exception e) {
                    log.warn("IP定位失败，IP: {}", dto.getIp(), e);
                    visitor.setIp(dto.getIp());
                }
            } else {
                visitor.setIp(dto.getIp());
            }
            
            visitorMapper.insert(visitor);
        } else {
            visitor.setVisitCount((visitor.getVisitCount() != null ? visitor.getVisitCount() : 0) + 1);
            visitor.setLastVisitTime(now);
            
            if (visitor.getCountry() == null && locationProviderFactory != null) {
                try {
                    List<LocationProviderPlugin> providers = locationProviderFactory.getProviders();
                    LocationInfo locationInfo = null;
                    for (LocationProviderPlugin locationProvider : providers) {
                        locationInfo = locationProvider.getLocationInfo(dto.getIp());
                        if (locationInfo != null) {
                            break;
                        }
                    }
                    if (locationInfo != null) {
                        if (locationInfo != null) {
                            visitor.setCountry(locationInfo.getCountry());
                            visitor.setProvince(locationInfo.getProvince());
                            visitor.setCity(locationInfo.getCity());
                            visitor.setDistrict(locationInfo.getDistrict());
                            visitor.setLatitude(locationInfo.getLatitude());
                            visitor.setLongitude(locationInfo.getLongitude());
                            visitor.setLocation(locationInfo.getLocation());
                            visitor.setIsp(locationInfo.getIsp());
                            visitor.setTimezone(locationInfo.getTimezone());
                        }
                    }
                } catch (Exception e) {
                    log.warn("IP定位失败，IP: {}", dto.getIp(), e);
                }
            }
            
            visitorMapper.updateById(visitor);
        }
        
        VisitorAccessLog log = new VisitorAccessLog();
        log.setVisitorId(visitor.getId());
        log.setVisitorUuid(visitor.getVisitorUuid());
        log.setIp(dto.getIp());
        log.setPageType(dto.getPageType());
        log.setPageId(dto.getPageId());
        log.setPageUrl(dto.getPageUrl());
        log.setSessionId(dto.getSessionId());
        log.setIsNewVisitor(isNewVisitor ? 1 : 0);
        log.setAccessTime(now);
        log.setTrafficSource("UNKNOWN");
        visitorAccessLogMapper.insert(log);
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


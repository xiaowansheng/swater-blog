package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.VisitStatisticsMapper;
import com.blog.mapper.VisitorAccessLogMapper;
import com.blog.mapper.VisitorMapper;
import com.blog.model.dto.VisitStatisticsQueryDTO;
import com.blog.model.entity.VisitStatistics;
import com.blog.model.entity.Visitor;
import com.blog.model.entity.VisitorAccessLog;
import com.blog.model.vo.VisitStatisticsVO;
import com.blog.service.VisitStatisticsService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VisitStatisticsServiceImpl implements VisitStatisticsService {
    @Autowired
    private VisitStatisticsMapper visitStatisticsMapper;

    @Autowired
    private VisitorAccessLogMapper visitorAccessLogMapper;

    @Autowired
    private VisitorMapper visitorMapper;

    @Override
    public PageResult<VisitStatisticsVO> list(VisitStatisticsQueryDTO queryDTO) {
        Page<VisitStatistics> page = PageUtil.buildPage(queryDTO);
        LambdaQueryWrapper<VisitStatistics> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getPageType() != null) {
            wrapper.eq(VisitStatistics::getPageType, queryDTO.getPageType());
        }
        if (queryDTO.getPageId() != null) {
            wrapper.eq(VisitStatistics::getPageId, queryDTO.getPageId());
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(VisitStatistics::getStatisticsDate, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(VisitStatistics::getStatisticsDate, queryDTO.getEndDate());
        }

        wrapper.orderByDesc(VisitStatistics::getStatisticsDate);
        Page<VisitStatistics> result = visitStatisticsMapper.selectPage(page, wrapper);

        List<VisitStatisticsVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return PageUtil.buildPageResult(result, voList);
    }

    @Override
    public VisitStatisticsVO getById(Long id) {
        VisitStatistics entity = visitStatisticsMapper.selectById(id);
        if (entity == null) {
            return null;
        }
        return convertToVO(entity);
    }

    @Override
    @Transactional
    public void aggregateStatistics(LocalDateTime date) {
        LocalDate localDate = date.toLocalDate();
        LocalDateTime startDateTime = localDate.atStartOfDay();
        LocalDateTime endDateTime = localDate.atTime(LocalTime.MAX);

        aggregateStatistics(startDateTime, endDateTime);
    }

    @Override
    @Transactional
    public void aggregateStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        LambdaQueryWrapper<VisitorAccessLog> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.ge(VisitorAccessLog::getAccessTime, startDate)
                .le(VisitorAccessLog::getAccessTime, endDate);

        List<VisitorAccessLog> logs = visitorAccessLogMapper.selectList(logWrapper);

        Map<String, List<VisitorAccessLog>> groupedLogs = logs.stream()
                .collect(Collectors.groupingBy(log -> {
                    LocalDate date = log.getAccessTime().toLocalDate();
                    return date + "|" + log.getPageType() + "|" + (log.getPageId() != null ? log.getPageId() : "");
                }));

        for (Map.Entry<String, List<VisitorAccessLog>> entry : groupedLogs.entrySet()) {
            String[] parts = entry.getKey().split("\\|");
            LocalDate date = LocalDate.parse(parts[0]);
            String pageType = parts[1];
            String pageId = parts.length > 2 && !parts[2].isEmpty() ? parts[2] : null;

            List<VisitorAccessLog> groupLogs = entry.getValue();

            long visitCount = groupLogs.size();
            long uniqueVisitorCount = groupLogs.stream()
                    .map(VisitorAccessLog::getVisitorUuid)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            Set<Long> visitorIds = groupLogs.stream()
                    .map(VisitorAccessLog::getVisitorId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, Object> geoStatistics = new HashMap<>();
            Map<String, Object> deviceStatistics = new HashMap<>();
            Map<String, Object> browserStatistics = new HashMap<>();

            if (!visitorIds.isEmpty()) {
                LambdaQueryWrapper<Visitor> visitorWrapper = new LambdaQueryWrapper<>();
                visitorWrapper.in(Visitor::getId, visitorIds);
                List<Visitor> visitors = visitorMapper.selectList(visitorWrapper);

                Map<String, Long> countryMap = new HashMap<>();
                Map<String, Long> provinceMap = new HashMap<>();
                Map<String, Long> cityMap = new HashMap<>();
                Map<String, Long> deviceTypeMap = new HashMap<>();
                Map<String, Long> deviceBrandMap = new HashMap<>();
                Map<String, Long> osMap = new HashMap<>();
                Map<String, Long> browserMap = new HashMap<>();

                for (Visitor visitor : visitors) {
                    if (visitor.getCountry() != null) {
                        countryMap.put(visitor.getCountry(), countryMap.getOrDefault(visitor.getCountry(), 0L) + 1);
                    }
                    if (visitor.getProvince() != null) {
                        provinceMap.put(visitor.getProvince(), provinceMap.getOrDefault(visitor.getProvince(), 0L) + 1);
                    }
                    if (visitor.getCity() != null) {
                        cityMap.put(visitor.getCity(), cityMap.getOrDefault(visitor.getCity(), 0L) + 1);
                    }
                    if (visitor.getDeviceType() != null) {
                        deviceTypeMap.put(visitor.getDeviceType(), deviceTypeMap.getOrDefault(visitor.getDeviceType(), 0L) + 1);
                    }
                    if (visitor.getDeviceBrand() != null) {
                        deviceBrandMap.put(visitor.getDeviceBrand(), deviceBrandMap.getOrDefault(visitor.getDeviceBrand(), 0L) + 1);
                    }
                    if (visitor.getOsName() != null) {
                        osMap.put(visitor.getOsName(), osMap.getOrDefault(visitor.getOsName(), 0L) + 1);
                    }
                    if (visitor.getBrowserName() != null) {
                        browserMap.put(visitor.getBrowserName(), browserMap.getOrDefault(visitor.getBrowserName(), 0L) + 1);
                    }
                }

                geoStatistics.put("country", countryMap);
                geoStatistics.put("province", provinceMap);
                geoStatistics.put("city", cityMap);

                deviceStatistics.put("deviceType", deviceTypeMap);
                deviceStatistics.put("deviceBrand", deviceBrandMap);
                deviceStatistics.put("os", osMap);

                browserStatistics.put("browser", browserMap);
            }

            LocalDateTime statisticsDate = date.atStartOfDay();
            VisitStatistics existing = visitStatisticsMapper.selectByTypeIdAndDate(pageType, pageId, statisticsDate);

            VisitStatistics statistics = new VisitStatistics();
            statistics.setPageType(pageType);
            statistics.setPageId(pageId);
            statistics.setStatisticsDate(statisticsDate);
            statistics.setVisitCount(visitCount);
            statistics.setUniqueVisitorCount(uniqueVisitorCount);
            statistics.setGeoStatistics(JsonUtil.toJson(geoStatistics));
            statistics.setDeviceStatistics(JsonUtil.toJson(deviceStatistics));
            statistics.setBrowserStatistics(JsonUtil.toJson(browserStatistics));

            if (existing != null) {
                statistics.setId(existing.getId());
                visitStatisticsMapper.updateById(statistics);
            } else {
                visitStatisticsMapper.insert(statistics);
            }
        }
    }

    private VisitStatisticsVO convertToVO(VisitStatistics entity) {
        VisitStatisticsVO vo = BeanUtil.copyProperties(entity, VisitStatisticsVO.class);
        if (vo != null) {
            if (entity.getGeoStatistics() != null) {
                vo.setGeoStatistics(JsonUtil.fromJson(entity.getGeoStatistics(), Map.class));
            }
            if (entity.getDeviceStatistics() != null) {
                vo.setDeviceStatistics(JsonUtil.fromJson(entity.getDeviceStatistics(), Map.class));
            }
            if (entity.getBrowserStatistics() != null) {
                vo.setBrowserStatistics(JsonUtil.fromJson(entity.getBrowserStatistics(), Map.class));
            }
        }
        return vo;
    }
}


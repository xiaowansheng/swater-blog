package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.VisitorAccessLogMapper;
import com.blog.mapper.VisitorMapper;
import com.blog.model.dto.VisitorAccessDTO;
import com.blog.model.entity.Visitor;
import com.blog.model.entity.VisitorAccessLog;
import com.blog.model.vo.VisitorStatisticsVO;
import com.blog.model.vo.VisitorVO;
import com.blog.service.VisitorService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
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

@Service
public class VisitorServiceImpl implements VisitorService {
    @Autowired
    private VisitorMapper visitorMapper;

    @Autowired
    private VisitorAccessLogMapper visitorAccessLogMapper;

    @Override
    @Transactional
    public void recordAccess(VisitorAccessDTO dto) {
        LocalDateTime now = LocalDateTime.now();
        Visitor visitor = null;
        
        if (dto.getVisitorUuid() != null && !dto.getVisitorUuid().isEmpty()) {
            visitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                    .eq(Visitor::getVisitorUuid, dto.getVisitorUuid())
                    .eq(Visitor::getDeleted, 0));
        }
        
        if (visitor == null) {
            visitor = visitorMapper.selectOne(new LambdaQueryWrapper<Visitor>()
                    .eq(Visitor::getIp, dto.getIp())
                    .eq(Visitor::getDeleted, 0));
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
            visitorMapper.insert(visitor);
        } else {
            visitor.setVisitCount((visitor.getVisitCount() != null ? visitor.getVisitCount() : 0) + 1);
            visitor.setLastVisitTime(now);
            visitorMapper.updateById(visitor);
        }
        
        VisitorAccessLog log = new VisitorAccessLog();
        log.setVisitorId(visitor.getId());
        log.setVisitorUuid(visitor.getVisitorUuid());
        log.setIpAddress(dto.getIp());
        log.setPageType(dto.getPageType());
        log.setPageId(dto.getPageId());
        log.setPageUrl(dto.getPageUrl());
        log.setReferer(dto.getReferer());
        log.setSessionId(dto.getSessionId());
        log.setIsNewVisitor(isNewVisitor ? 1 : 0);
        log.setIsPageView(1);
        log.setAccessTime(now);
        log.setTrafficSource("UNKNOWN");
        visitorAccessLogMapper.insert(log);
    }

    @Override
    public PageResult<VisitorVO> list(Long page, Long size, String keyword) {
        Page<Visitor> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Visitor> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Visitor::getDeleted, 0);
        
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
        visitorWrapper.eq(Visitor::getDeleted, 0);
        if (startDate != null) {
            visitorWrapper.ge(Visitor::getFirstVisitTime, startDate);
        }
        if (endDate != null) {
            visitorWrapper.le(Visitor::getFirstVisitTime, endDate);
        }
        statistics.setTotalVisitors(visitorMapper.selectCount(visitorWrapper).longValue());
        
        LambdaQueryWrapper<VisitorAccessLog> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.eq(VisitorAccessLog::getDeleted, 0);
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
        
        statistics.setVisitorsByDate(byDate);
        statistics.setVisitorsByCountry(byCountry);
        statistics.setVisitorsByCity(byCity);
        statistics.setVisitorsByDevice(byDevice);
        statistics.setVisitorsByBrowser(byBrowser);
        statistics.setVisitorsByOs(byOs);
        
        return statistics;
    }
}


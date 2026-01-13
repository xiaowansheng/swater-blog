package com.blog.modules.statistics.visitor.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.statistics.visitor.mapper.VisitorMapper;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import com.blog.modules.statistics.visitor.model.vo.VisitorStatisticsVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import com.blog.modules.statistics.track.mapper.TrackStatisticsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
public class VisitorServiceImpl implements VisitorService {
    @Autowired
    private VisitorMapper visitorMapper;

    @Autowired
    private TrackStatisticsMapper trackStatisticsMapper;

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
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();
        
        LambdaQueryWrapper<Visitor> visitorWrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            visitorWrapper.ge(Visitor::getFirstVisitTime, startDate);
        }
        if (endDate != null) {
            visitorWrapper.le(Visitor::getFirstVisitTime, endDate);
        }
        statistics.setTotalVisitors(visitorMapper.selectCount(visitorWrapper).longValue());

        statistics.setTotalPageViews(zeroIfNull(trackStatisticsMapper.countPv(start, end)));
        statistics.setUniqueVisitors(zeroIfNull(trackStatisticsMapper.countUv(start, end)));
        
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

    private long zeroIfNull(Long value) {
        return value != null ? value : 0L;
    }
}


package com.blog.modules.statistics.visitor.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.statistics.visitor.mapper.VisitorMapper;
import com.blog.modules.statistics.track.mapper.VisitorTrackAdminMapper;
import com.blog.modules.statistics.visitor.model.vo.VisitorPageViewVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorSessionVO;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import com.blog.modules.statistics.visitor.model.vo.VisitorStatisticsVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorTrackingDetailVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import com.blog.modules.statistics.track.mapper.TrackStatisticsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
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

    @Autowired
    private VisitorTrackAdminMapper visitorTrackAdminMapper;

    @Override
    public PageResult<VisitorVO> list(Long page, Long size, String ip, String country, String province, String city, String deviceType, String osName, String browserName, String trafficSource) {
        Page<Visitor> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Visitor> wrapper = new LambdaQueryWrapper<>();

        if (ip != null && !ip.isEmpty()) {
            wrapper.like(Visitor::getIp, ip);
        }
        if (country != null && !country.isEmpty()) {
            wrapper.like(Visitor::getCountry, country);
        }
        if (province != null && !province.isEmpty()) {
            wrapper.like(Visitor::getProvince, province);
        }
        if (city != null && !city.isEmpty()) {
            wrapper.like(Visitor::getCity, city);
        }
        if (deviceType != null && !deviceType.isEmpty()) {
            wrapper.eq(Visitor::getDeviceType, deviceType);
        }
        if (osName != null && !osName.isEmpty()) {
            wrapper.like(Visitor::getOsName, osName);
        }
        if (browserName != null && !browserName.isEmpty()) {
            wrapper.like(Visitor::getBrowserName, browserName);
        }
        if (trafficSource != null && !trafficSource.isEmpty()) {
            wrapper.eq(Visitor::getTrafficSource, trafficSource);
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

        // 各维度聚合下推到 SQL GROUP BY，避免把全表 visitor 拉进内存（大数据量会 OOM）。
        // byDate 的 dim 来自 DATE(first_visit_time)，格式化为 yyyy-MM-dd 以兼容前端图表。
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        statistics.setVisitorsByDate(toMap(visitorMapper.countByDate(startDate, endDate), dim -> formatDateDim(dim, formatter)));
        statistics.setVisitorsByCountry(toMap(visitorMapper.countByCountry(startDate, endDate), dim -> stringDim(dim)));
        statistics.setVisitorsByCity(toMap(visitorMapper.countByCity(startDate, endDate), dim -> stringDim(dim)));
        statistics.setVisitorsByDevice(toMap(visitorMapper.countByDeviceType(startDate, endDate), dim -> stringDim(dim)));
        statistics.setVisitorsByBrowser(toMap(visitorMapper.countByBrowserName(startDate, endDate), dim -> stringDim(dim)));
        statistics.setVisitorsByOs(toMap(visitorMapper.countByOsName(startDate, endDate), dim -> stringDim(dim)));

        return statistics;
    }

    /**
     * 将 GROUP BY 聚合结果（dim/cnt 两列）组装成 维度值→计数 的 Map。
     */
    private Map<String, Long> toMap(List<Map<String, Object>> rows, java.util.function.Function<Object, String> keyFn) {
        Map<String, Long> result = new HashMap<>();
        if (rows == null || rows.isEmpty()) {
            return result;
        }
        for (Map<String, Object> row : rows) {
            Object dim = row.get("dim");
            Object cnt = row.get("cnt");
            if (dim == null) {
                continue;
            }
            String key = keyFn.apply(dim);
            if (key == null || key.isEmpty()) {
                continue;
            }
            long count = cnt instanceof Number ? ((Number) cnt).longValue() : 0L;
            result.merge(key, count, Long::sum);
        }
        return result;
    }

    /**
     * 日期维度归一化：DATE() 可能返回 java.sql.Date / LocalDate / String，统一格式化为 yyyy-MM-dd。
     */
    private String formatDateDim(Object dim, DateTimeFormatter formatter) {
        if (dim == null) {
            return null;
        }
        if (dim instanceof java.time.LocalDate localDate) {
            return localDate.format(formatter);
        }
        if (dim instanceof java.time.LocalDateTime localDateTime) {
            return localDateTime.format(formatter);
        }
        if (dim instanceof java.sql.Date sqlDate) {
            return sqlDate.toLocalDate().format(formatter);
        }
        return dim.toString();
    }

    private String stringDim(Object dim) {
        return dim == null ? null : dim.toString();
    }

    @Override
    public VisitorTrackingDetailVO getTrackingDetail(Long visitorId, Integer limit) {
        VisitorTrackingDetailVO detail = new VisitorTrackingDetailVO();
        detail.setVisitorId(visitorId);

        if (visitorId == null) {
            detail.setLatestSessions(Collections.emptyList());
            return detail;
        }

        int safeLimit = limit != null && limit > 0 && limit <= 100 ? limit : 20;
        VisitorSessionVO firstSession = visitorTrackAdminMapper.selectFirstSession(visitorId);
        List<VisitorSessionVO> latestSessions = visitorTrackAdminMapper.selectLatestSessions(visitorId, safeLimit);

        detail.setFirstSession(firstSession);
        detail.setLatestSessions(latestSessions != null ? latestSessions : Collections.emptyList());
        return detail;
    }

    @Override
    public List<VisitorPageViewVO> getSessionPages(Long visitorId, String sessionId) {
        if (visitorId == null || sessionId == null || sessionId.isBlank()) {
            return Collections.emptyList();
        }
        List<VisitorPageViewVO> pages = visitorTrackAdminMapper.selectSessionPages(visitorId, sessionId);
        return pages != null ? pages : Collections.emptyList();
    }

    private long zeroIfNull(Long value) {
        return value != null ? value : 0L;
    }
}

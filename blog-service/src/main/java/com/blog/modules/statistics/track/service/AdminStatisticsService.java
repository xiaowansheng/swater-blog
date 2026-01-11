package com.blog.modules.statistics.track.service;


import com.blog.modules.statistics.track.model.vo.AdminStatisticsOverviewVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTopPageVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTrendVO;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminStatisticsService {
    AdminStatisticsOverviewVO overview(LocalDateTime start, LocalDateTime end);

    AdminStatisticsTrendVO dailyTrend(String metric, LocalDateTime start, LocalDateTime end);

    List<AdminStatisticsTopPageVO> topPages(LocalDateTime start, LocalDateTime end, Integer limit, String orderBy);
}


package com.blog.modules.statistics.statistics.service;


import com.blog.common.PageResult;
import com.blog.modules.statistics.statistics.model.dto.VisitStatisticsQueryDTO;
import com.blog.modules.statistics.statistics.model.vo.VisitStatisticsVO;
public interface VisitStatisticsService {
    PageResult<VisitStatisticsVO> list(VisitStatisticsQueryDTO queryDTO);

    VisitStatisticsVO getById(Long id);

    void aggregateStatistics(java.time.LocalDateTime date);

    void aggregateStatistics(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}


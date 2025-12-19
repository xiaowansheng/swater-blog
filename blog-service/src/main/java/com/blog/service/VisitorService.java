package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.dto.VisitorAccessDTO;
import com.blog.model.vo.VisitorStatisticsVO;
import com.blog.model.vo.VisitorVO;

import java.time.LocalDateTime;

public interface VisitorService {
    void recordAccess(VisitorAccessDTO dto);

    PageResult<VisitorVO> list(Long page, Long size, String keyword);

    VisitorStatisticsVO getStatistics(LocalDateTime startDate, LocalDateTime endDate);
}


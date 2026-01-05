package com.blog.modules.statistics.visitor.service;



import com.blog.shared.PageResult;
import com.blog.modules.statistics.visitor.model.dto.VisitorAccessDTO;
import com.blog.modules.statistics.visitor.model.vo.VisitorStatisticsVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import java.time.LocalDateTime;
public interface VisitorService {
    void recordAccess(VisitorAccessDTO dto);

    PageResult<VisitorVO> list(Long page, Long size, String keyword);

    VisitorStatisticsVO getStatistics(LocalDateTime startDate, LocalDateTime endDate);
}


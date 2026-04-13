package com.blog.modules.statistics.visitor.service;



import com.blog.shared.PageResult;
import com.blog.modules.statistics.visitor.model.vo.VisitorPageViewVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorSessionVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorStatisticsVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorTrackingDetailVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import java.time.LocalDateTime;
import java.util.List;
public interface VisitorService {
    PageResult<VisitorVO> list(Long page, Long size, String ip, String country, String province, String city, String deviceType, String osName, String browserName, String trafficSource);

    VisitorStatisticsVO getStatistics(LocalDateTime startDate, LocalDateTime endDate);

    VisitorTrackingDetailVO getTrackingDetail(Long visitorId, Integer limit);

    List<VisitorPageViewVO> getSessionPages(Long visitorId, String sessionId);
}

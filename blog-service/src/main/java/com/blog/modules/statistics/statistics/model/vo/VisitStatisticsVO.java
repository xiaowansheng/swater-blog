package com.blog.modules.statistics.statistics.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.util.Map;
@Data
@EqualsAndHashCode(callSuper = true)
public class VisitStatisticsVO extends com.blog.shared.model.vo.BaseVO {
    private String pageType;

    private String pageId;

    private LocalDateTime statisticsDate;

    private Long visitCount;

    private Long uniqueVisitorCount;

    private Map<String, Object> geoStatistics;

    private Map<String, Object> deviceStatistics;

    private Map<String, Object> browserStatistics;
}


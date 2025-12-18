package com.blog.model.vo;

import lombok.Data;
import java.util.Map;

@Data
public class VisitorStatisticsVO {
    private Long totalVisitors;

    private Long totalPageViews;

    private Long uniqueVisitors;

    private Map<String, Long> visitorsByDate;

    private Map<String, Long> visitorsByCountry;

    private Map<String, Long> visitorsByCity;

    private Map<String, Long> visitorsByDevice;

    private Map<String, Long> visitorsByBrowser;

    private Map<String, Long> visitorsByOs;
}


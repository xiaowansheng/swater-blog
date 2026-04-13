package com.blog.modules.statistics.visitor.model.vo;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitorSessionVO {
    private Long id;
    private Long visitorId;
    private String sessionId;
    private LocalDateTime startedAt;
    private LocalDateTime lastActivityAt;
    private String entryPageKey;
    private String entryReferer;
    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
    private String landingPageUrl;
    private Long pageCount;
}

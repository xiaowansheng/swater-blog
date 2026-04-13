package com.blog.modules.statistics.visitor.model.vo;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitorPageViewVO {
    private Long id;
    private Long visitorId;
    private String sessionId;
    private String pageKey;
    private String pageUrl;
    private String referer;
    private LocalDateTime occurredAt;
}

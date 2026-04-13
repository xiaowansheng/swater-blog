package com.blog.modules.statistics.visitor.model.vo;


import lombok.Data;

import java.util.List;

@Data
public class VisitorTrackingDetailVO {
    private Long visitorId;
    private VisitorSessionVO firstSession;
    private List<VisitorSessionVO> latestSessions;
}

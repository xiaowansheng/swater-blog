package com.blog.modules.statistics.visitor.model.vo;


import lombok.Data;

@Data
public class VisitorAccessResultVO {
    private String visitorUuid;
    private boolean newVisitor;
    private boolean skipped; // true when ignored due to 24h window
}


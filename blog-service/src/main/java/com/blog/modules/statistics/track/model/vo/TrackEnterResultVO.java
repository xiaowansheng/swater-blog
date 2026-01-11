package com.blog.modules.statistics.track.model.vo;


import lombok.Data;

@Data
public class TrackEnterResultVO {
    private String visitorUuid;

    private String sessionId;

    private boolean newVisitor;

    private boolean newSession;

    private boolean pagePvCounted;

    private boolean contentReadCounted;
}


package com.blog.modules.statistics.track.model.dto;


import lombok.Data;

@Data
public class ContentLikeActionDTO {
    private String visitorUuid;
    private String contentType;
    private Long contentId;
    private String action; // LIKE / UNLIKE / TOGGLE
}


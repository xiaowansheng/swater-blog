package com.blog.modules.statistics.track.model.vo;


import lombok.Data;

@Data
public class ContentLikeResultVO {
    private String visitorUuid;
    private boolean liked;
    private Long likeCount;
}


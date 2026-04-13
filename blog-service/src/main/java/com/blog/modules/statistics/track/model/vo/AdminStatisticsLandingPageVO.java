package com.blog.modules.statistics.track.model.vo;


import lombok.Data;

@Data
public class AdminStatisticsLandingPageVO {
    private String pageKey;
    private String landingPageUrl;
    private Long sessions;
    private Long uv;
}

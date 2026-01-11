package com.blog.modules.statistics.track.model.vo;


import lombok.Data;

@Data
public class AdminStatisticsTopPageVO {
    private String pageKey;
    private Long pv;
    private Long uv;
    private Long sessions;
}


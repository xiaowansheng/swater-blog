package com.blog.modules.statistics.track.model.vo;


import lombok.Data;

@Data
public class AdminStatisticsTrafficSourceVO {
    private String source;
    private Long sessions;
    private Long uv;
}

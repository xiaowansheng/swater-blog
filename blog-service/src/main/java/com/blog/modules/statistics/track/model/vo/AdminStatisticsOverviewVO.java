package com.blog.modules.statistics.track.model.vo;


import lombok.Data;

@Data
public class AdminStatisticsOverviewVO {
    private Long uv;
    private Long newUv;
    private Long sessions;
    private Long pv;
    private Double pagesPerSession;

    private Long articleReads;
    private Long talkReads;
    private Long totalReads;

    private Long articleLikes;
    private Long talkLikes;
    private Long totalLikes;

    private Long articleComments;
    private Long talkComments;
    private Long totalComments;
}


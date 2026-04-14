package com.blog.modules.statistics.track.model.dto;


import lombok.Data;

@Data
public class TrackEnterDTO {
    private String visitorUuid;

    /**
     * 页面去重主键：如 PAGE:/post/xxx，ARTICLE:123，TALK:456
     */
    private String pageKey;

    private String pageUrl;

    private String referer;

    /**
     * 是否为当前文档的首次进入（整页导航），SPA 站内跳转为 false。
     */
    private Boolean documentNavigation;

    private String utmSource;

    private String utmMedium;

    private String utmCampaign;

    /**
     * 内容阅读去重类型：ARTICLE/TALK
     */
    private String contentType;

    /**
     * 内容ID（文章/说说主键）
     */
    private Long contentId;
}

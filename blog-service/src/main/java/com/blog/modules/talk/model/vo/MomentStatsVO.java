package com.blog.modules.talk.model.vo;

import lombok.Data;

/**
 * 说说统计 VO：批量/单篇读取浏览、点赞、评论数（只读，不产生自增副作用）。
 */
@Data
public class MomentStatsVO {
    private Long id;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
}

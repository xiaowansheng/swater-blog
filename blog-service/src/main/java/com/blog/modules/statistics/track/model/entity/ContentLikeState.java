package com.blog.modules.statistics.track.model.entity;


import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("content_like_state")
public class ContentLikeState extends com.blog.shared.model.entity.BaseEntity {
    @TableField("visitor_id")
    private Long visitorId;

    @TableField("content_type")
    private String contentType;

    @TableField("content_id")
    private Long contentId;

    private Integer liked;

    @TableField("last_changed_at")
    private LocalDateTime lastChangedAt;
}


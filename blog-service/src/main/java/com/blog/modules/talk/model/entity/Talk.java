package com.blog.modules.talk.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("talk")
public class Talk extends com.blog.shared.model.entity.BaseEntity {
    @TableField("talk_key")
    private String talkKey;

    private String content;

    private String images;

    @TableField("author_id")
    private Long authorId;

    @TableField("like_count")
    private Integer likeCount;

    @TableField("comment_count")
    private Integer commentCount;

    private String status;

    @TableField("is_top")
    private Integer isTop;

    private String ip;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String device;

    private String browser;
}


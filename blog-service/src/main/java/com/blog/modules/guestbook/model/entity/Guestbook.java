package com.blog.modules.guestbook.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("guestbook")
public class Guestbook extends com.blog.shared.model.entity.BaseEntity {
    private String content;

    private String images;

    @TableField("user_id")
    private Long userId;

    private String type;

    private String nickname;

    private String email;

    private String qq;

    private String ip;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String ipLocation;

    private String device;

    private String browser;

    @TableField("is_visible")
    private Integer isVisible;

    @TableField("review_status")
    private Integer reviewStatus;
}


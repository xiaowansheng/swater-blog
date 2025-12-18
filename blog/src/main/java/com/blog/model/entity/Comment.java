package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("comment")
public class Comment extends BaseEntity {
    @TableField("comment_key")
    private String commentKey;

    private String content;

    private String images;

    @TableField("post_id")
    private Long postId;

    @TableField("moment_id")
    private Long momentId;

    @TableField("user_id")
    private Long userId;

    @TableField("parent_id")
    private Long parentId;

    @TableField("root_id")
    private Long rootId;

    private String type;

    private String nickname;

    private String email;

    private String qq;

    private Integer status;

    @TableField("is_visible")
    private Integer isVisible;

    private String ip;

    @TableField("ip_address")
    private String ipAddress;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @TableField("location_detail")
    private String locationDetail;

    @TableField("device_info")
    private String deviceInfo;

    private String device;

    private String browser;

    private String location;
}


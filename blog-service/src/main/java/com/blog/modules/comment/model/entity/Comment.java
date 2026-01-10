package com.blog.modules.comment.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("comment")
public class Comment extends com.blog.shared.model.entity.BaseEntity {
    private String content;

    private String images;

    @TableField("target_id")
    private Long targetId;

    @TableField("target_type")
    private String targetType;

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

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String device;

    private String browser;
}

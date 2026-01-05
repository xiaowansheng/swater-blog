package com.blog.modules.notification.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_notification")
public class SysNotification extends com.blog.shared.model.entity.BaseEntity {
    @TableField("user_id")
    private Long userId;

    private String type;

    private String title;

    private String content;

    @TableField("is_read")
    private Integer isRead;

    @TableField("notice_type")
    private String noticeType;

    private String channel;

    private String recipient;

    @TableField("template_id")
    private String templateId;

    @TableField("template_params")
    private String templateParams;

    private String status;

    @TableField("send_count")
    private Integer sendCount;

    @TableField("max_retry_count")
    private Integer maxRetryCount;

    @TableField("next_retry_time")
    private LocalDateTime nextRetryTime;

    @TableField("sent_time")
    private LocalDateTime sentTime;

    @TableField("expire_time")
    private LocalDateTime expireTime;

    @TableField("business_id")
    private String businessId;

    @TableField("business_type")
    private String businessType;

    private Integer priority;

    private Integer immediate;

    private String remark;
}


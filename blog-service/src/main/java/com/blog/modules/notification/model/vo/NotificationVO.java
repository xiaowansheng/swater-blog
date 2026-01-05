package com.blog.modules.notification.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
@Data
@EqualsAndHashCode(callSuper = true)
public class NotificationVO extends com.blog.shared.model.vo.BaseVO {
    private Long userId;

    private String userName;

    private String type;

    private String title;

    private String content;

    private Integer isRead;

    private String status;

    private String businessId;

    private String businessType;

    private Integer priority;

    private LocalDateTime sentTime;

    private LocalDateTime expireTime;
}


package com.blog.modules.notification.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
@Data
@EqualsAndHashCode(callSuper = true)
public class NotificationDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotBlank(message = "通知类型不能为空")
    private String type;

    @NotBlank(message = "通知标题不能为空")
    private String title;

    private String content;

    private String businessId;

    private String businessType;

    private Integer priority;

    private Integer immediate;
}


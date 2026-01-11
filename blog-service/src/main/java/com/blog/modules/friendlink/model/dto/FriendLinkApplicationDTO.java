package com.blog.modules.friendlink.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

/**
 * 友链申请DTO（前台访客申请友链使用）
 */
@Data
public class FriendLinkApplicationDTO {

    @NotBlank(message = "网站名称不能为空")
    private String name;

    @NotBlank(message = "网站链接不能为空")
    @URL(message = "请输入正确的URL格式")
    private String url;

    private String logo;

    private String description;

    private String author;

    @NotBlank(message = "联系邮箱不能为空")
    private String email;

    private String emailCode;
}

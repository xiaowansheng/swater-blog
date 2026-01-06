package com.blog.modules.friendlink.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.URL;
import lombok.Data;

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
}

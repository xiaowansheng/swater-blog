package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;

@Data
@EqualsAndHashCode(callSuper = true)
public class FriendLinkDTO extends BaseDTO {
    @NotBlank(message = "友链名称不能为空")
    private String name;

    @NotBlank(message = "链接地址不能为空")
    private String url;

    private String logo;

    private String description;

    private String author;

    private Integer status;

    private Integer isVisible;

    private Integer reviewStatus;

    private Integer sort;

    private Long userId;
}


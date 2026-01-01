package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MenuDTO extends BaseDTO {
    @NotBlank(message = "菜单标题不能为空")
    private String title;

    private String icon;

    private String redirect;

    @NotBlank(message = "路由地址不能为空")
    private String path;

    private String component;

    private Integer hidden;

    private Integer sort;

    private Long parentId;

    private String perms;

    private String description;

    private List<Long> roleIds;
}


package com.blog.modules.system.api.model.dto;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;
@Data
public class ApiDTO {
    private String apiKey;

    @NotBlank(message = "接口名称不能为空")
    private String name;

    private String path;

    private String method;

    private String description;

    private Long parentId;

    private Integer isOpen;

    private String perms;

    private Integer sort;
}

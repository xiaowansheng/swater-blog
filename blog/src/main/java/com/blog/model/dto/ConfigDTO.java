package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;

@Data
@EqualsAndHashCode(callSuper = true)
public class ConfigDTO extends BaseDTO {
    @NotBlank(message = "配置键不能为空")
    private String configKey;

    @NotBlank(message = "配置名称不能为空")
    private String name;

    @NotBlank(message = "配置值不能为空")
    private String value;

    private String type;

    private String description;

    private String groupName;

    private Integer sort;
}


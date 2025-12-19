package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;

@Data
@EqualsAndHashCode(callSuper = true)
public class TagDTO extends BaseDTO {
    @NotBlank(message = "标签名称不能为空")
    private String name;

    private String slug;

    private String color;

    private String description;

    private String status;
}


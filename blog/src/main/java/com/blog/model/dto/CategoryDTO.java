package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;

@Data
@EqualsAndHashCode(callSuper = true)
public class CategoryDTO extends BaseDTO {
    @NotBlank(message = "分类名称不能为空")
    private String name;

    private String slug;

    private String description;

    private Long parentId;

    private Integer sort;

    private String status;
}


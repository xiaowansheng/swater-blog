package com.blog.modules.article.model.dto;

import com.blog.shared.model.dto.BaseDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DirectoryNodeDTO extends BaseDTO {
    @NotBlank(message = "节点名称不能为空")
    private String name;

    private String description;

    private Long parentId;

    private Integer sort;
}

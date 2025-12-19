package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;

@Data
@EqualsAndHashCode(callSuper = true)
public class AlbumDTO extends BaseDTO {
    @NotBlank(message = "相册名称不能为空")
    private String name;

    private String description;

    private String cover;

    private String status;
}


package com.blog.model.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class AboutDTO {
    @NotBlank(message = "关于内容不能为空")
    private String content;
}


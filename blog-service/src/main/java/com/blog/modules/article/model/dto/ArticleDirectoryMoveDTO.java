package com.blog.modules.article.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ArticleDirectoryMoveDTO {
    @NotBlank(message = "移动对象类型不能为空")
    @Pattern(regexp = "NODE|ARTICLE", message = "移动对象类型只能是 NODE 或 ARTICLE")
    private String itemType;

    @NotNull(message = "移动对象ID不能为空")
    private Long itemId;

    @NotBlank(message = "目标类型不能为空")
    @Pattern(regexp = "ROOT|NODE|ARTICLE", message = "目标类型只能是 ROOT、NODE 或 ARTICLE")
    private String targetType;

    private Long targetId;

    @NotBlank(message = "放置位置不能为空")
    @Pattern(regexp = "INSIDE|BEFORE|AFTER", message = "放置位置只能是 INSIDE、BEFORE 或 AFTER")
    private String position;
}

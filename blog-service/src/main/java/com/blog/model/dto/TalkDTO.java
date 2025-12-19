package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class TalkDTO extends BaseDTO {
    @NotBlank(message = "说说内容不能为空")
    private String content;

    private List<String> images;

    private String status;

    private Integer isTop;
}


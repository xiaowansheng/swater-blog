package com.blog.modules.talk.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class TalkDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotBlank(message = "说说内容不能为空")
    private String content;

    private List<String> images;

    private String status;

    private Integer isTop;
}


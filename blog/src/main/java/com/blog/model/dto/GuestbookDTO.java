package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class GuestbookDTO extends BaseDTO {
    @NotBlank(message = "留言内容不能为空")
    private String content;

    private List<String> images;

    private String type;

    private String nickname;

    private String email;

    private String qq;
}


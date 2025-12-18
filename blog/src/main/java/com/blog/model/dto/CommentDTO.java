package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class CommentDTO extends BaseDTO {
    @NotBlank(message = "评论内容不能为空")
    private String content;

    private List<String> images;

    private Long postId;

    private Long momentId;

    private Long parentId;

    private String type;

    private String nickname;

    private String email;

    private String qq;
}


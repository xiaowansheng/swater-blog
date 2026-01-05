package com.blog.modules.comment.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class CommentDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotBlank(message = "评论内容不能为空")
    private String content;

    private List<String> images;

    private Long targetId;

    private String targetType;

    private Long parentId;

    private String type;

    private String nickname;

    private String email;

    private String qq;
}


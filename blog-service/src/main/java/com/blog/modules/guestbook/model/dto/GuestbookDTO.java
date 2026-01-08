package com.blog.modules.guestbook.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class GuestbookDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotBlank(message = "留言内容不能为空")
    private String content;

    private List<String> images;

    private String type;

    private String nickname;

    private String email;

    private String qq;

    private String emailCode;
}


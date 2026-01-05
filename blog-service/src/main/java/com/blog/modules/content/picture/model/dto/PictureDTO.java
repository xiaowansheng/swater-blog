package com.blog.modules.content.picture.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
@Data
@EqualsAndHashCode(callSuper = true)
public class PictureDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotNull(message = "相册ID不能为空")
    private Long albumId;

    @NotBlank(message = "图片名称不能为空")
    private String name;

    private String description;

    @NotBlank(message = "图片地址不能为空")
    private String url;

    private String source;

    private String status;
}


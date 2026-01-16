package com.blog.modules.friendlink.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
@Data
@EqualsAndHashCode(callSuper = true)
public class FriendLinkDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotBlank(message = "友链名称不能为空")
    private String name;

    @NotBlank(message = "链接地址不能为空")
    private String url;

    private String logo;

    private String description;

    private String author;

    private Integer isVisible;

    private Integer reviewStatus;

    private Integer sort;

    private Long userId;
}


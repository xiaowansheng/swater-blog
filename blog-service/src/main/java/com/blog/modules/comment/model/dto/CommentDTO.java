package com.blog.modules.comment.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class CommentDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotBlank(message = "评论内容不能为空")
    private String content;

    private List<String> images;

    /**
     * 图片文件ID列表（前端维护，包含内容中使用的所有文件）
     */
    private List<Long> referencedFileIds;

    private Long targetId;

    private String targetType;
    
    private Long rootId;

    private Long parentId;

    private String type;

    private String nickname;

    private String email;

    private String qq;

    private String captcha;

    /**
     * 游客保持“自己的评论”可识别的 token（前端生成保存）
     */

    private String ip;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String device;

    private String browser;
}


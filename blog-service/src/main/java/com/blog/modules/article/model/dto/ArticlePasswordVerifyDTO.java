package com.blog.modules.article.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 文章密码验证请求体。
 * 密码放在请求体而非 URL query，避免进入访问日志 / 浏览器历史 / Referer。
 */
@Data
public class ArticlePasswordVerifyDTO {

    @NotBlank(message = "密码不能为空")
    private String password;
}

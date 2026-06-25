package com.blog.modules.article.model.vo;

import lombok.Data;

/**
 * 文章解锁结果：包含一次性返回的正文，以及后续复用的解锁 token（替代在客户端存储明文密码）。
 */
@Data
public class ArticleUnlockVO {
    /** 后续凭 token 复用解锁，避免重复输密码；带 TTL，存 Redis。 */
    private String token;
    /** 本次解锁后的文章正文。 */
    private ArticleVO article;
}

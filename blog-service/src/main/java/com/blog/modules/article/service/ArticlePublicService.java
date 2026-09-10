package com.blog.modules.article.service;


import com.blog.shared.PageResult;
import com.blog.modules.article.model.vo.ArticleVO;
import java.util.List;
public interface ArticlePublicService {
    PageResult<ArticleVO> list(Long page, Long size, Long categoryId, Long tagId, String keyword);

    ArticleVO getById(Long id);
    ArticleVO getBySlug(String slug);
    ArticleVO getByKey(String key);
    List<ArticleVO> getHotArticles(Integer limit);

    List<ArticleVO> getLatestArticles(Integer limit);

    List<ArticleVO> getRelatedArticles(Long articleId, Integer limit);

    boolean verifyPassword(Long articleId, String password);

    ArticleVO getByIdWithContent(Long id);

    /**
     * 验证密码并签发一次性解锁 token（绑定 articleId，带 TTL，存 Redis）。
     * @return token，密码错误时返回 null
     */
    String verifyAndIssueToken(Long articleId, String password);

    /**
     * 凭解锁 token 获取文章正文。token 失效或文章不需要密码时返回 null。
     */
    ArticleVO getByUnlockToken(Long articleId, String token);

    /**
     * 批量获取文章统计（只读，不增加浏览数）；未发布/已删除的 id 不返回。
     */
    java.util.List<com.blog.modules.article.model.vo.ArticleStatsVO> getStatsByIds(java.util.List<Long> ids);

    /**
     * 获取单篇文章统计（只读），不存在返回 null。
     */
    com.blog.modules.article.model.vo.ArticleStatsVO getArticleStats(Long id);
}

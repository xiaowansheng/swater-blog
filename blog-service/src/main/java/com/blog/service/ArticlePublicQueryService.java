package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.ArticleVO;
import java.util.List;

public interface ArticlePublicQueryService {
    PageResult<ArticleVO> list(Long page, Long size, Long categoryId, Long tagId, String keyword);

    ArticleVO getById(Long id);
    ArticleVO getBySlug(String slug);
    ArticleVO getByKey(String key);
    List<ArticleVO> getHotArticles(Integer limit);

    List<ArticleVO> getLatestArticles(Integer limit);
}


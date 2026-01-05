package com.blog.modules.article.service;


import com.blog.shared.PageResult;
import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.article.model.vo.ArticleStatisticsVO;
public interface ArticleAdminQueryService {
    PageResult<ArticleVO> list(Long page, Long size, Integer status, Long categoryId, String keyword);

    ArticleVO getById(Long id);

    ArticleStatisticsVO getStatistics();
}


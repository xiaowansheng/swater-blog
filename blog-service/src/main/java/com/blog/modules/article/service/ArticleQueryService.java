package com.blog.modules.article.service;


import com.blog.shared.PageResult;
import com.blog.modules.article.model.dto.ArticleQueryDTO;
import com.blog.modules.article.model.vo.ArticleStatisticsVO;
import com.blog.modules.article.model.vo.ArticleVO;
public interface ArticleQueryService {
    PageResult<ArticleVO> list(ArticleQueryDTO queryDTO);

    ArticleVO getById(Long id);

    ArticleStatisticsVO getStatistics();
}

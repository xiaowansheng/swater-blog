package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.ArticleVO;
import com.blog.model.vo.ArticleStatisticsVO;

public interface ArticleAdminQueryService {
    PageResult<ArticleVO> list(Long page, Long size, Integer status, Long categoryId, String keyword);

    ArticleVO getById(Long id);

    ArticleStatisticsVO getStatistics();
}


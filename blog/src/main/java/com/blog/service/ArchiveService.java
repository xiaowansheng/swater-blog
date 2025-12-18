package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.ArchiveVO;
import com.blog.model.vo.ArticleVO;
import java.util.List;

public interface ArchiveService {
    List<ArchiveVO> list();

    PageResult<ArticleVO> getArticlesByYearAndMonth(Integer year, Integer month, Long page, Long size);

    void regenerate();
}


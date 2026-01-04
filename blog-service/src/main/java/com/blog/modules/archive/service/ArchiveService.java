package com.blog.modules.archive.service;


import com.blog.common.PageResult;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.modules.article.model.vo.ArticleVO;
import java.util.List;
public interface ArchiveService {
    List<ArchiveVO> list();

    PageResult<ArticleVO> getArticlesByYearAndMonth(Integer year, Integer month, Long page, Long size);

    void regenerate();
}


package com.blog.modules.archive.service;

import com.blog.modules.article.model.vo.ArticleVO;
import com.blog.modules.archive.model.vo.ArchiveVO;
import com.blog.shared.PageResult;
import java.util.List;

public interface ArchiveAdminService {
    List<ArchiveVO> listAll();

    /**
     * 按年月查询文章列表（管理端，含各状态文章）
     */
    PageResult<ArticleVO> listArticlesByMonth(int year, int month, Long page, Long size);
}

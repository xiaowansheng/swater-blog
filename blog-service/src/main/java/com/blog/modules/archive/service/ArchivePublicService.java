package com.blog.modules.archive.service;

import com.blog.shared.PageResult;
import com.blog.modules.article.model.vo.ArticleVO;

public interface ArchivePublicService {
    /**
     * 归档文章列表查询，只按创建时间倒序排列，不受置顶影响
     */
    PageResult<ArticleVO> list(Long page, Long size);
}

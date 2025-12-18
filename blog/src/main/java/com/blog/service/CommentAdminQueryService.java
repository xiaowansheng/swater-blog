package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.CommentVO;

public interface CommentAdminQueryService {
    PageResult<CommentVO> list(Long page, Long size, Integer status, Long postId, Long momentId);

    CommentVO getById(Long id);
}


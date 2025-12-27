package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.CommentVO;

public interface CommentAdminQueryService {
    PageResult<CommentVO> list(Long page, Long size, Integer status, Long targetId, String targetType);

    CommentVO getById(Long id);
}


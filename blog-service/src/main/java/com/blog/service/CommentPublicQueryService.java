package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.CommentVO;

public interface CommentPublicQueryService {
    PageResult<CommentVO> list(Long targetId, String targetType, Long page, Long size);
}


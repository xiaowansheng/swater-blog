package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.CommentVO;

public interface CommentPublicQueryService {
    PageResult<CommentVO> list(Long postId, Long momentId, Long page, Long size);
}


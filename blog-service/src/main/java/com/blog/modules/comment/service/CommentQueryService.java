package com.blog.modules.comment.service;


import com.blog.shared.PageResult;
import com.blog.modules.comment.model.vo.CommentVO;
public interface CommentQueryService {
    PageResult<CommentVO> list(Long page, Long size, Integer status, Long targetId, String targetType);

    CommentVO getById(Long id);
}


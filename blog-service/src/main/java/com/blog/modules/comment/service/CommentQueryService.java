package com.blog.modules.comment.service;


import com.blog.shared.PageResult;
import com.blog.modules.comment.model.vo.CommentVO;
import com.blog.modules.comment.model.dto.CommentQueryDTO;

public interface CommentQueryService {
    PageResult<CommentVO> list(CommentQueryDTO queryDTO);

    CommentVO getById(Long id);
}


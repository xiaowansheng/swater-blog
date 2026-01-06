package com.blog.modules.comment.service;


import com.blog.shared.PageResult;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.comment.model.vo.CommentVO;
public interface CommentPublicService {
    CommentVO create(CommentDTO dto);

    PageResult<CommentVO> list(Long targetId, String targetType, Long page, Long size);
}


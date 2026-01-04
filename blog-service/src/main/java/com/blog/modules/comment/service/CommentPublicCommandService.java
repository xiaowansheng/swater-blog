package com.blog.modules.comment.service;


import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.comment.model.vo.CommentVO;
public interface CommentPublicCommandService {
    CommentVO create(CommentDTO dto);
}


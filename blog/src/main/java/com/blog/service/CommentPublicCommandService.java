package com.blog.service;

import com.blog.model.dto.CommentDTO;
import com.blog.model.vo.CommentVO;

public interface CommentPublicCommandService {
    CommentVO create(CommentDTO dto);
}


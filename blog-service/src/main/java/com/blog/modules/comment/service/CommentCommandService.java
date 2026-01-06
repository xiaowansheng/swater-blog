package com.blog.modules.comment.service;

public interface CommentCommandService {
    void approve(Long id);

    void reject(Long id);

    void delete(Long id);

    void setVisible(Long id);

    void setHidden(Long id);
}


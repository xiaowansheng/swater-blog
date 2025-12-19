package com.blog.service;

import com.blog.model.dto.TalkDTO;

public interface TalkAdminCommandService {
    Long create(TalkDTO dto);

    void update(Long id, TalkDTO dto);

    void delete(Long id);

    void setTop(Long id);

    void cancelTop(Long id);
}


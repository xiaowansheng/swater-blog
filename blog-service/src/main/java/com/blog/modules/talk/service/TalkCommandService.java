package com.blog.modules.talk.service;


import com.blog.modules.talk.model.dto.TalkDTO;
public interface TalkCommandService {
    Long create(TalkDTO dto);

    void update(Long id, TalkDTO dto);

    void delete(Long id);

    void setTop(Long id);

    void cancelTop(Long id);
}


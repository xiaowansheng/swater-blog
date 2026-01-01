package com.blog.service;

import com.blog.model.dto.TagDTO;
import com.blog.model.vo.TagVO;
import java.util.List;

public interface TagService {
    List<TagVO> list();

    List<TagVO> listPublic();

    TagVO getById(Long id);

    TagVO getByKey(String key);

    Long create(TagDTO dto);

    void update(Long id, TagDTO dto);

    void delete(Long id);

    Long findOrCreateByName(String name);
}


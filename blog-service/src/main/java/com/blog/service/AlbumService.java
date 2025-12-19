package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.dto.AlbumDTO;
import com.blog.model.vo.AlbumVO;

public interface AlbumService {
    PageResult<AlbumVO> list(Long page, Long size, Long userId, String status);

    AlbumVO getById(Long id);

    Long create(AlbumDTO dto);

    void update(Long id, AlbumDTO dto);

    void delete(Long id);
}


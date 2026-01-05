package com.blog.modules.album.service;


import com.blog.shared.PageResult;
import com.blog.modules.album.model.dto.AlbumDTO;
import com.blog.modules.album.model.vo.AlbumVO;
public interface AlbumService {
    PageResult<AlbumVO> list(Long page, Long size, Long userId, String status);

    AlbumVO getById(Long id);

    Long create(AlbumDTO dto);

    void update(Long id, AlbumDTO dto);

    void delete(Long id);
}


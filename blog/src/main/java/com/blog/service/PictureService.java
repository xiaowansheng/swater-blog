package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.dto.PictureDTO;
import com.blog.model.vo.PictureVO;

public interface PictureService {
    PageResult<PictureVO> list(Long page, Long size, Long albumId);

    PictureVO getById(Long id);

    Long create(PictureDTO dto);

    void update(Long id, PictureDTO dto);

    void delete(Long id);

    void moveToAlbum(Long id, Long albumId);
}


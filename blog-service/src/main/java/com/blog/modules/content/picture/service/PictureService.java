package com.blog.modules.content.picture.service;


import com.blog.common.PageResult;
import com.blog.modules.content.picture.model.dto.PictureDTO;
import com.blog.modules.content.picture.model.vo.PictureVO;
public interface PictureService {
    PageResult<PictureVO> list(Long page, Long size, Long albumId);

    PictureVO getById(Long id);

    Long create(PictureDTO dto);

    void update(Long id, PictureDTO dto);

    void delete(Long id);

    void moveToAlbum(Long id, Long albumId);
}


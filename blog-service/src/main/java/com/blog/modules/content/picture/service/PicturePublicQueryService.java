package com.blog.modules.content.picture.service;


import com.blog.common.PageResult;
import com.blog.modules.content.picture.model.vo.PictureVO;
public interface PicturePublicQueryService {
    PageResult<PictureVO> list(Long page, Long size, Long albumId);

    PictureVO getById(Long id);
}


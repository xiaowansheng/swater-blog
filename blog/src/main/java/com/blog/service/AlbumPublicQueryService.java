package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.AlbumVO;

public interface AlbumPublicQueryService {
    PageResult<AlbumVO> list(Long page, Long size);

    AlbumVO getById(Long id);
}


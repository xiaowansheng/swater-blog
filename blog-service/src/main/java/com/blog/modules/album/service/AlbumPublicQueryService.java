package com.blog.modules.album.service;


import com.blog.shared.PageResult;
import com.blog.modules.album.model.vo.AlbumVO;
public interface AlbumPublicQueryService {
    PageResult<AlbumVO> list(Long page, Long size);

    AlbumVO getById(Long id);

    AlbumVO getByKey(String key);
}


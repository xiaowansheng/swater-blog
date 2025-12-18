package com.blog.mapper;

import com.blog.model.entity.Picture;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PictureMapper extends com.blog.mapper.BaseMapper<Picture> {
    List<Picture> selectByAlbumId(@Param("albumId") Long albumId);

    Integer countByAlbumId(@Param("albumId") Long albumId);
}


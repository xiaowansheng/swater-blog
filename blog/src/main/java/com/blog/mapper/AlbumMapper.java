package com.blog.mapper;

import com.blog.model.entity.Album;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AlbumMapper extends com.blog.mapper.BaseMapper<Album> {
}


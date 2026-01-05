package com.blog.modules.content.picture.mapper;




import com.blog.shared.model.BaseMapper;
import com.blog.modules.content.picture.model.entity.Picture;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface PictureMapper extends com.blog.shared.model.BaseMapper<Picture> {
    List<Picture> selectByAlbumId(@Param("albumId") Long albumId);

    Integer countByAlbumId(@Param("albumId") Long albumId);
}


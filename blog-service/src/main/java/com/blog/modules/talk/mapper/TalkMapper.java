package com.blog.modules.talk.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.talk.model.entity.Talk;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;
@Mapper
public interface TalkMapper extends com.blog.shared.model.BaseMapper<Talk> {
    @Update("UPDATE talk SET view_count = IFNULL(view_count, 0) + 1 WHERE id = #{id} AND deleted = 0")
    int incrementViewCount(@Param("id") Long id);

    @Update("UPDATE talk SET like_count = IFNULL(like_count, 0) + 1 WHERE id = #{id} AND deleted = 0")
    int incrementLikeCount(@Param("id") Long id);

    @Update("UPDATE talk SET like_count = IF(like_count IS NULL OR like_count <= 0, 0, like_count - 1) WHERE id = #{id} AND deleted = 0")
    int decrementLikeCount(@Param("id") Long id);
}

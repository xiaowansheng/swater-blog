package com.blog.modules.statistics.track.mapper;


import com.blog.modules.statistics.track.model.entity.ContentLikeState;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

@Mapper
public interface ContentLikeStateMapper extends com.blog.shared.model.BaseMapper<ContentLikeState> {
    @Update("""
            UPDATE content_like_state
            SET liked = 1, last_changed_at = #{now}
            WHERE deleted = 0
              AND visitor_id = #{visitorId}
              AND content_type = #{contentType}
              AND content_id = #{contentId}
              AND liked = 0
            """)
    int likeIfNotLiked(
            @Param("visitorId") Long visitorId,
            @Param("contentType") String contentType,
            @Param("contentId") Long contentId,
            @Param("now") LocalDateTime now
    );

    @Update("""
            UPDATE content_like_state
            SET liked = 0, last_changed_at = #{now}
            WHERE deleted = 0
              AND visitor_id = #{visitorId}
              AND content_type = #{contentType}
              AND content_id = #{contentId}
              AND liked = 1
            """)
    int unlikeIfLiked(
            @Param("visitorId") Long visitorId,
            @Param("contentType") String contentType,
            @Param("contentId") Long contentId,
            @Param("now") LocalDateTime now
    );
}


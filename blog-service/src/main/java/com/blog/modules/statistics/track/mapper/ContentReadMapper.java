package com.blog.modules.statistics.track.mapper;


import com.blog.modules.statistics.track.model.entity.ContentRead;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

@Mapper
public interface ContentReadMapper extends com.blog.shared.model.BaseMapper<ContentRead> {
    @Insert("""
            INSERT INTO content_read (visitor_id, content_type, content_id, last_counted_at, deleted, create_time, update_time)
            VALUES (#{visitorId}, #{contentType}, #{contentId}, #{now}, 0, #{now}, #{now})
            ON DUPLICATE KEY UPDATE
                last_counted_at = IF(
                    deleted = 1 OR last_counted_at IS NULL OR last_counted_at < DATE_SUB(#{now}, INTERVAL 24 HOUR),
                    VALUES(last_counted_at),
                    last_counted_at
                ),
                deleted = 0
            """)
    int upsertReadAndTouch(@Param("visitorId") Long visitorId,
                           @Param("contentType") String contentType,
                           @Param("contentId") Long contentId,
                           @Param("now") LocalDateTime now);
}

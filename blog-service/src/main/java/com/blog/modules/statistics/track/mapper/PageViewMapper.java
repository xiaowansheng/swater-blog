package com.blog.modules.statistics.track.mapper;


import com.blog.modules.statistics.track.model.entity.PageView;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

@Mapper
public interface PageViewMapper extends com.blog.shared.model.BaseMapper<PageView> {
    @Insert("""
            INSERT IGNORE INTO page_view
            (visitor_id, session_id, page_key, page_url, referer, occurred_at, deleted, create_time, update_time)
            VALUES
            (#{visitorId}, #{sessionId}, #{pageKey}, #{pageUrl}, #{referer}, #{occurredAt}, 0, #{now}, #{now})
            """)
    int insertIgnore(@Param("visitorId") Long visitorId,
                     @Param("sessionId") String sessionId,
                     @Param("pageKey") String pageKey,
                     @Param("pageUrl") String pageUrl,
                     @Param("referer") String referer,
                     @Param("occurredAt") LocalDateTime occurredAt,
                     @Param("now") LocalDateTime now);
}

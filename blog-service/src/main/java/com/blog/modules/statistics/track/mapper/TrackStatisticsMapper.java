package com.blog.modules.statistics.track.mapper;


import com.blog.modules.statistics.track.model.vo.AdminStatisticsTopPageVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTrendPointVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TrackStatisticsMapper {

    @Select("""
            SELECT COUNT(*)
            FROM page_view
            WHERE deleted = 0
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            """)
    Long countPv(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT COUNT(DISTINCT visitor_id)
            FROM page_view
            WHERE deleted = 0
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            """)
    Long countUv(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT COUNT(*)
            FROM visitor_session
            WHERE deleted = 0
              AND started_at >= #{start}
              AND started_at <= #{end}
            """)
    Long countSessions(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT COUNT(*)
            FROM visitor
            WHERE deleted = 0
              AND first_visit_time >= #{start}
              AND first_visit_time <= #{end}
            """)
    Long countNewUv(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT COALESCE(SUM(delta), 0)
            FROM content_metric_event
            WHERE deleted = 0
              AND metric = #{metric}
              AND content_type = #{contentType}
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            """)
    Long sumMetricByType(
            @Param("metric") String metric,
            @Param("contentType") String contentType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Select("""
            SELECT DATE_FORMAT(occurred_at, '%Y-%m-%d') AS date,
                   COUNT(*) AS value
            FROM page_view
            WHERE deleted = 0
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            GROUP BY DATE_FORMAT(occurred_at, '%Y-%m-%d')
            ORDER BY DATE_FORMAT(occurred_at, '%Y-%m-%d')
            """)
    List<AdminStatisticsTrendPointVO> pvDaily(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT DATE_FORMAT(occurred_at, '%Y-%m-%d') AS date,
                   COUNT(DISTINCT visitor_id) AS value
            FROM page_view
            WHERE deleted = 0
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            GROUP BY DATE_FORMAT(occurred_at, '%Y-%m-%d')
            ORDER BY DATE_FORMAT(occurred_at, '%Y-%m-%d')
            """)
    List<AdminStatisticsTrendPointVO> uvDaily(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT DATE_FORMAT(started_at, '%Y-%m-%d') AS date,
                   COUNT(*) AS value
            FROM visitor_session
            WHERE deleted = 0
              AND started_at >= #{start}
              AND started_at <= #{end}
            GROUP BY DATE_FORMAT(started_at, '%Y-%m-%d')
            ORDER BY DATE_FORMAT(started_at, '%Y-%m-%d')
            """)
    List<AdminStatisticsTrendPointVO> sessionsDaily(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT DATE_FORMAT(first_visit_time, '%Y-%m-%d') AS date,
                   COUNT(*) AS value
            FROM visitor
            WHERE deleted = 0
              AND first_visit_time >= #{start}
              AND first_visit_time <= #{end}
            GROUP BY DATE_FORMAT(first_visit_time, '%Y-%m-%d')
            ORDER BY DATE_FORMAT(first_visit_time, '%Y-%m-%d')
            """)
    List<AdminStatisticsTrendPointVO> newUvDaily(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT DATE_FORMAT(occurred_at, '%Y-%m-%d') AS date,
                   COALESCE(SUM(delta), 0) AS value
            FROM content_metric_event
            WHERE deleted = 0
              AND metric = #{metric}
              AND content_type = #{contentType}
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            GROUP BY DATE_FORMAT(occurred_at, '%Y-%m-%d')
            ORDER BY DATE_FORMAT(occurred_at, '%Y-%m-%d')
            """)
    List<AdminStatisticsTrendPointVO> contentMetricDaily(
            @Param("metric") String metric,
            @Param("contentType") String contentType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Select("""
            SELECT page_key AS pageKey,
                   COUNT(*) AS pv,
                   COUNT(DISTINCT visitor_id) AS uv,
                   COUNT(DISTINCT CONCAT(visitor_id, '#', session_id)) AS sessions
            FROM page_view
            WHERE deleted = 0
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            GROUP BY page_key
            ORDER BY pv DESC
            LIMIT #{limit}
            """)
    List<AdminStatisticsTopPageVO> topPagesOrderByPv(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("limit") Integer limit
    );

    @Select("""
            SELECT page_key AS pageKey,
                   COUNT(*) AS pv,
                   COUNT(DISTINCT visitor_id) AS uv,
                   COUNT(DISTINCT CONCAT(visitor_id, '#', session_id)) AS sessions
            FROM page_view
            WHERE deleted = 0
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            GROUP BY page_key
            ORDER BY uv DESC
            LIMIT #{limit}
            """)
    List<AdminStatisticsTopPageVO> topPagesOrderByUv(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("limit") Integer limit
    );

    @Select("""
            SELECT page_key AS pageKey,
                   COUNT(*) AS pv,
                   COUNT(DISTINCT visitor_id) AS uv,
                   COUNT(DISTINCT CONCAT(visitor_id, '#', session_id)) AS sessions
            FROM page_view
            WHERE deleted = 0
              AND occurred_at >= #{start}
              AND occurred_at <= #{end}
            GROUP BY page_key
            ORDER BY sessions DESC
            LIMIT #{limit}
            """)
    List<AdminStatisticsTopPageVO> topPagesOrderBySessions(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("limit") Integer limit
    );
}

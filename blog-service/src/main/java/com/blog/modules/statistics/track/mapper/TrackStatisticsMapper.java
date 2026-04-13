package com.blog.modules.statistics.track.mapper;


import com.blog.modules.statistics.track.model.vo.AdminStatisticsTopPageVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsLandingPageVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTrafficSourceVO;
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

    @Select("""
            SELECT
                CASE
                    WHEN vs.utm_source IS NOT NULL AND vs.utm_source <> '' THEN 'UTM'
                    WHEN vs.entry_referer IS NULL OR vs.entry_referer = '' THEN 'DIRECT'
                    WHEN LOWER(vs.entry_referer) LIKE '%google.%'
                      OR LOWER(vs.entry_referer) LIKE '%bing.%'
                      OR LOWER(vs.entry_referer) LIKE '%baidu.%'
                      OR LOWER(vs.entry_referer) LIKE '%yahoo.%'
                    THEN 'SEARCH'
                    ELSE 'REFERRAL'
                END AS source,
                COUNT(*) AS sessions,
                COUNT(DISTINCT vs.visitor_id) AS uv
            FROM visitor_session vs
            WHERE vs.deleted = 0
              AND vs.started_at >= #{start}
              AND vs.started_at <= #{end}
            GROUP BY source
            ORDER BY sessions DESC, uv DESC
            """)
    List<AdminStatisticsTrafficSourceVO> trafficSources(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Select("""
            SELECT
                t.pageKey AS pageKey,
                MIN(t.landingPageUrl) AS landingPageUrl,
                COUNT(*) AS sessions,
                COUNT(DISTINCT t.visitorId) AS uv
            FROM (
                SELECT
                    vs.visitor_id AS visitorId,
                    vs.entry_page_key AS pageKey,
                    (
                        SELECT pv.page_url
                        FROM page_view pv
                        WHERE pv.deleted = 0
                          AND pv.visitor_id = vs.visitor_id
                          AND pv.session_id = vs.session_id
                          AND pv.page_key = vs.entry_page_key
                        ORDER BY pv.occurred_at ASC, pv.id ASC
                        LIMIT 1
                    ) AS landingPageUrl,
                    CASE
                        WHEN vs.utm_source IS NOT NULL AND vs.utm_source <> '' THEN 'UTM'
                        WHEN vs.entry_referer IS NULL OR vs.entry_referer = '' THEN 'DIRECT'
                        WHEN LOWER(vs.entry_referer) LIKE '%google.%'
                          OR LOWER(vs.entry_referer) LIKE '%bing.%'
                          OR LOWER(vs.entry_referer) LIKE '%baidu.%'
                          OR LOWER(vs.entry_referer) LIKE '%yahoo.%'
                        THEN 'SEARCH'
                        ELSE 'REFERRAL'
                    END AS source
                FROM visitor_session vs
                WHERE vs.deleted = 0
                  AND vs.started_at >= #{start}
                  AND vs.started_at <= #{end}
                  AND vs.entry_page_key IS NOT NULL
                  AND vs.entry_page_key <> ''
            ) t
            WHERE #{source} IS NULL
               OR #{source} = ''
               OR #{source} = 'ALL'
               OR t.source = #{source}
            GROUP BY t.pageKey
            ORDER BY sessions DESC, uv DESC
            LIMIT #{limit}
            """)
    List<AdminStatisticsLandingPageVO> topLandingPagesOrderBySessions(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("limit") Integer limit,
            @Param("source") String source
    );

    @Select("""
            SELECT
                t.pageKey AS pageKey,
                MIN(t.landingPageUrl) AS landingPageUrl,
                COUNT(*) AS sessions,
                COUNT(DISTINCT t.visitorId) AS uv
            FROM (
                SELECT
                    vs.visitor_id AS visitorId,
                    vs.entry_page_key AS pageKey,
                    (
                        SELECT pv.page_url
                        FROM page_view pv
                        WHERE pv.deleted = 0
                          AND pv.visitor_id = vs.visitor_id
                          AND pv.session_id = vs.session_id
                          AND pv.page_key = vs.entry_page_key
                        ORDER BY pv.occurred_at ASC, pv.id ASC
                        LIMIT 1
                    ) AS landingPageUrl,
                    CASE
                        WHEN vs.utm_source IS NOT NULL AND vs.utm_source <> '' THEN 'UTM'
                        WHEN vs.entry_referer IS NULL OR vs.entry_referer = '' THEN 'DIRECT'
                        WHEN LOWER(vs.entry_referer) LIKE '%google.%'
                          OR LOWER(vs.entry_referer) LIKE '%bing.%'
                          OR LOWER(vs.entry_referer) LIKE '%baidu.%'
                          OR LOWER(vs.entry_referer) LIKE '%yahoo.%'
                        THEN 'SEARCH'
                        ELSE 'REFERRAL'
                    END AS source
                FROM visitor_session vs
                WHERE vs.deleted = 0
                  AND vs.started_at >= #{start}
                  AND vs.started_at <= #{end}
                  AND vs.entry_page_key IS NOT NULL
                  AND vs.entry_page_key <> ''
            ) t
            WHERE #{source} IS NULL
               OR #{source} = ''
               OR #{source} = 'ALL'
               OR t.source = #{source}
            GROUP BY t.pageKey
            ORDER BY uv DESC, sessions DESC
            LIMIT #{limit}
            """)
    List<AdminStatisticsLandingPageVO> topLandingPagesOrderByUv(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("limit") Integer limit,
            @Param("source") String source
    );

    @Select("""
            SELECT COUNT(*)
            FROM page_view
            WHERE deleted = 0
            """)
    Long countTotalPv();

    @Select("""
            SELECT COUNT(DISTINCT visitor_id)
            FROM page_view
            WHERE deleted = 0
            """)
    Long countTotalUv();
}

package com.blog.modules.statistics.track.mapper;


import com.blog.modules.statistics.visitor.model.vo.VisitorPageViewVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorSessionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface VisitorTrackAdminMapper {
    @Select("""
            SELECT
                vs.id AS id,
                vs.visitor_id AS visitorId,
                vs.session_id AS sessionId,
                vs.started_at AS startedAt,
                vs.last_activity_at AS lastActivityAt,
                vs.entry_page_key AS entryPageKey,
                vs.entry_referer AS entryReferer,
                vs.utm_source AS utmSource,
                vs.utm_medium AS utmMedium,
                vs.utm_campaign AS utmCampaign,
                (
                    SELECT pv.page_url
                    FROM page_view pv
                    WHERE pv.deleted = 0
                      AND pv.visitor_id = vs.visitor_id
                      AND pv.session_id = vs.session_id
                    ORDER BY pv.occurred_at ASC, pv.id ASC
                    LIMIT 1
                ) AS landingPageUrl,
                (
                    SELECT COUNT(*)
                    FROM page_view pv
                    WHERE pv.deleted = 0
                      AND pv.visitor_id = vs.visitor_id
                      AND pv.session_id = vs.session_id
                ) AS pageCount
            FROM visitor_session vs
            WHERE vs.deleted = 0
              AND vs.visitor_id = #{visitorId}
            ORDER BY vs.started_at ASC, vs.id ASC
            LIMIT 1
            """)
    VisitorSessionVO selectFirstSession(@Param("visitorId") Long visitorId);

    @Select("""
            SELECT
                vs.id AS id,
                vs.visitor_id AS visitorId,
                vs.session_id AS sessionId,
                vs.started_at AS startedAt,
                vs.last_activity_at AS lastActivityAt,
                vs.entry_page_key AS entryPageKey,
                vs.entry_referer AS entryReferer,
                vs.utm_source AS utmSource,
                vs.utm_medium AS utmMedium,
                vs.utm_campaign AS utmCampaign,
                (
                    SELECT pv.page_url
                    FROM page_view pv
                    WHERE pv.deleted = 0
                      AND pv.visitor_id = vs.visitor_id
                      AND pv.session_id = vs.session_id
                    ORDER BY pv.occurred_at ASC, pv.id ASC
                    LIMIT 1
                ) AS landingPageUrl,
                (
                    SELECT COUNT(*)
                    FROM page_view pv
                    WHERE pv.deleted = 0
                      AND pv.visitor_id = vs.visitor_id
                      AND pv.session_id = vs.session_id
                ) AS pageCount
            FROM visitor_session vs
            WHERE vs.deleted = 0
              AND vs.visitor_id = #{visitorId}
            ORDER BY vs.started_at DESC, vs.id DESC
            LIMIT #{limit}
            """)
    List<VisitorSessionVO> selectLatestSessions(@Param("visitorId") Long visitorId, @Param("limit") Integer limit);

    @Select("""
            SELECT
                pv.id AS id,
                pv.visitor_id AS visitorId,
                pv.session_id AS sessionId,
                pv.page_key AS pageKey,
                pv.page_url AS pageUrl,
                pv.referer AS referer,
                pv.occurred_at AS occurredAt
            FROM page_view pv
            WHERE pv.deleted = 0
              AND pv.visitor_id = #{visitorId}
              AND pv.session_id = #{sessionId}
            ORDER BY pv.occurred_at ASC, pv.id ASC
            """)
    List<VisitorPageViewVO> selectSessionPages(@Param("visitorId") Long visitorId, @Param("sessionId") String sessionId);
}

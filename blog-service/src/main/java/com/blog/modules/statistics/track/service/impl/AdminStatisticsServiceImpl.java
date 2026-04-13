package com.blog.modules.statistics.track.service.impl;


import com.blog.modules.statistics.track.mapper.TrackStatisticsMapper;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsOverviewVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTopPageVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsLandingPageVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTrafficSourceVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTrendPointVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTrendVO;
import com.blog.modules.statistics.track.service.AdminStatisticsService;
import com.blog.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class AdminStatisticsServiceImpl implements AdminStatisticsService {
    @Autowired
    private TrackStatisticsMapper trackStatisticsMapper;

    @Override
    public AdminStatisticsOverviewVO overview(LocalDateTime start, LocalDateTime end) {
        try {
            AdminStatisticsOverviewVO vo = new AdminStatisticsOverviewVO();

            Long pv = trackStatisticsMapper.countPv(start, end);
            Long sessions = trackStatisticsMapper.countSessions(start, end);

            vo.setPv(pv != null ? pv : 0L);
            vo.setUv(zeroIfNull(trackStatisticsMapper.countUv(start, end)));
            vo.setNewUv(zeroIfNull(trackStatisticsMapper.countNewUv(start, end)));
            vo.setSessions(sessions != null ? sessions : 0L);
            vo.setPagesPerSession(sessions != null && sessions > 0 ? (pv != null ? (pv * 1.0 / sessions) : 0.0) : 0.0);

            vo.setArticleReads(zeroIfNull(trackStatisticsMapper.sumMetricByType("READ", "ARTICLE", start, end)));
            vo.setTalkReads(zeroIfNull(trackStatisticsMapper.sumMetricByType("READ", "TALK", start, end)));
            vo.setTotalReads(vo.getArticleReads() + vo.getTalkReads());

            vo.setArticleLikes(zeroIfNull(trackStatisticsMapper.sumMetricByType("LIKE", "ARTICLE", start, end)));
            vo.setTalkLikes(zeroIfNull(trackStatisticsMapper.sumMetricByType("LIKE", "TALK", start, end)));
            vo.setTotalLikes(vo.getArticleLikes() + vo.getTalkLikes());

            vo.setArticleComments(zeroIfNull(trackStatisticsMapper.sumMetricByType("COMMENT", "ARTICLE", start, end)));
            vo.setTalkComments(zeroIfNull(trackStatisticsMapper.sumMetricByType("COMMENT", "TALK", start, end)));
            vo.setTotalComments(vo.getArticleComments() + vo.getTalkComments());

            return vo;
        } catch (Exception e) {
            throw toStatisticsException(e);
        }
    }

    @Override
    public AdminStatisticsTrendVO dailyTrend(String metric, LocalDateTime start, LocalDateTime end) {
        try {
            String normalized = StringUtils.hasText(metric) ? metric.trim() : "";
            AdminStatisticsTrendVO vo = new AdminStatisticsTrendVO();
            vo.setMetric(normalized);

            List<AdminStatisticsTrendPointVO> points = switch (normalized) {
                case "pv" -> trackStatisticsMapper.pvDaily(start, end);
                case "uv" -> trackStatisticsMapper.uvDaily(start, end);
                case "sessions" -> trackStatisticsMapper.sessionsDaily(start, end);
                case "newUv" -> trackStatisticsMapper.newUvDaily(start, end);
                case "articleReads" -> trackStatisticsMapper.contentMetricDaily("READ", "ARTICLE", start, end);
                case "talkReads" -> trackStatisticsMapper.contentMetricDaily("READ", "TALK", start, end);
                case "articleLikes" -> trackStatisticsMapper.contentMetricDaily("LIKE", "ARTICLE", start, end);
                case "talkLikes" -> trackStatisticsMapper.contentMetricDaily("LIKE", "TALK", start, end);
                case "articleComments" -> trackStatisticsMapper.contentMetricDaily("COMMENT", "ARTICLE", start, end);
                case "talkComments" -> trackStatisticsMapper.contentMetricDaily("COMMENT", "TALK", start, end);
                default -> Collections.emptyList();
            };

            vo.setPoints(points);
            return vo;
        } catch (Exception e) {
            throw toStatisticsException(e);
        }
    }

    @Override
    public List<AdminStatisticsTopPageVO> topPages(LocalDateTime start, LocalDateTime end, Integer limit, String orderBy) {
        try {
            int safeLimit = limit != null && limit > 0 && limit <= 200 ? limit : 20;
            String normalized = StringUtils.hasText(orderBy) ? orderBy.trim() : "pv";
            return switch (normalized) {
                case "uv" -> trackStatisticsMapper.topPagesOrderByUv(start, end, safeLimit);
                case "sessions" -> trackStatisticsMapper.topPagesOrderBySessions(start, end, safeLimit);
                default -> trackStatisticsMapper.topPagesOrderByPv(start, end, safeLimit);
            };
        } catch (Exception e) {
            throw toStatisticsException(e);
        }
    }

    @Override
    public List<AdminStatisticsTrafficSourceVO> trafficSources(LocalDateTime start, LocalDateTime end) {
        try {
            return trackStatisticsMapper.trafficSources(start, end);
        } catch (Exception e) {
            throw toStatisticsException(e);
        }
    }

    @Override
    public List<AdminStatisticsLandingPageVO> topLandingPages(LocalDateTime start, LocalDateTime end, Integer limit, String orderBy, String source) {
        try {
            int safeLimit = limit != null && limit > 0 && limit <= 200 ? limit : 20;
            String normalized = StringUtils.hasText(orderBy) ? orderBy.trim() : "sessions";
            return switch (normalized) {
                case "uv" -> trackStatisticsMapper.topLandingPagesOrderByUv(start, end, safeLimit, source);
                default -> trackStatisticsMapper.topLandingPagesOrderBySessions(start, end, safeLimit, source);
            };
        } catch (Exception e) {
            throw toStatisticsException(e);
        }
    }

    private long zeroIfNull(Long value) {
        return value != null ? value : 0L;
    }

    private BusinessException toStatisticsException(Exception e) {
        Throwable root = e;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String message = root.getMessage() != null ? root.getMessage() : e.getMessage();
        message = message != null ? message : "unknown";

        String lower = message.toLowerCase();
        if (lower.contains("doesn't exist") || lower.contains("does not exist") || lower.contains("unknown column")
                || lower.contains("table") && lower.contains("doesn't exist")) {
            return new BusinessException(500, "统计表未初始化或缺少字段，请执行数据库迁移并重启服务：" + message);
        }
        if (lower.contains("syntax") || lower.contains("sql")) {
            return new BusinessException(500, "统计查询SQL执行失败：" + message);
        }
        return new BusinessException(500, "统计查询失败：" + message);
    }
}

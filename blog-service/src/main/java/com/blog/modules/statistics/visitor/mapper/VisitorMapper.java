package com.blog.modules.statistics.visitor.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
@Mapper
public interface VisitorMapper extends com.blog.shared.model.BaseMapper<Visitor> {
    @Insert("""
            INSERT INTO visitor (
                visitor_uuid, ip, country, province, city, district, latitude, longitude, location, isp, timezone,
                device_type, device_brand, device_model, os_name, os_version, browser_name, browser_version,
                referer_url, traffic_source, search_engine, search_keywords, utm_source, utm_medium, utm_campaign,
                visit_count, last_visit_time, first_visit_time, status, deleted, create_time, update_time
            )
            VALUES (
                #{visitorUuid}, #{ip}, #{country}, #{province}, #{city}, #{district}, #{latitude}, #{longitude}, #{location}, #{isp}, #{timezone},
                #{deviceType}, #{deviceBrand}, #{deviceModel}, #{osName}, #{osVersion}, #{browserName}, #{browserVersion},
                #{refererUrl}, #{trafficSource}, #{searchEngine}, #{searchKeywords}, #{utmSource}, #{utmMedium}, #{utmCampaign},
                1, #{now}, #{now}, 'ACTIVE', 0, #{now}, #{now}
            )
            ON DUPLICATE KEY UPDATE
                ip = VALUES(ip),
                country = VALUES(country),
                province = VALUES(province),
                city = VALUES(city),
                district = VALUES(district),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                location = VALUES(location),
                isp = VALUES(isp),
                timezone = VALUES(timezone),
                device_type = VALUES(device_type),
                device_brand = VALUES(device_brand),
                device_model = VALUES(device_model),
                os_name = VALUES(os_name),
                os_version = VALUES(os_version),
                browser_name = VALUES(browser_name),
                browser_version = VALUES(browser_version),
                referer_url = IF(#{refreshSource}, VALUES(referer_url), referer_url),
                traffic_source = IF(#{refreshSource}, VALUES(traffic_source), traffic_source),
                search_engine = IF(#{refreshSource}, VALUES(search_engine), search_engine),
                search_keywords = IF(#{refreshSource}, VALUES(search_keywords), search_keywords),
                utm_source = IF(#{refreshSource}, VALUES(utm_source), utm_source),
                utm_medium = IF(#{refreshSource}, VALUES(utm_medium), utm_medium),
                utm_campaign = IF(#{refreshSource}, VALUES(utm_campaign), utm_campaign),
                visit_count = IF(
                    deleted = 1 OR last_visit_time IS NULL OR last_visit_time < DATE_SUB(VALUES(last_visit_time), INTERVAL 24 HOUR),
                    COALESCE(visit_count, 0) + 1,
                    visit_count
                ),
                last_visit_time = VALUES(last_visit_time),
                first_visit_time = IFNULL(first_visit_time, VALUES(first_visit_time)),
                status = 'ACTIVE',
                deleted = 0,
                update_time = VALUES(update_time)
            """)
    int upsertVisitorHeartbeat(
            @Param("visitorUuid") String visitorUuid,
            @Param("ip") String ip,
            @Param("country") String country,
            @Param("province") String province,
            @Param("city") String city,
            @Param("district") String district,
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("location") String location,
            @Param("isp") String isp,
            @Param("timezone") String timezone,
            @Param("deviceType") String deviceType,
            @Param("deviceBrand") String deviceBrand,
            @Param("deviceModel") String deviceModel,
            @Param("osName") String osName,
            @Param("osVersion") String osVersion,
            @Param("browserName") String browserName,
            @Param("browserVersion") String browserVersion,
            @Param("refererUrl") String refererUrl,
            @Param("trafficSource") String trafficSource,
            @Param("searchEngine") String searchEngine,
            @Param("searchKeywords") String searchKeywords,
            @Param("utmSource") String utmSource,
            @Param("utmMedium") String utmMedium,
            @Param("utmCampaign") String utmCampaign,
            @Param("refreshSource") Boolean refreshSource,
            @Param("now") LocalDateTime now
    );

    // ========== 统计聚合方法（SQL GROUP BY 下推，避免全量加载到内存） ==========
    // 每个 SELECT 返回 dim（维度值）和 cnt（计数）两列，调用方按需组装成 Map。

    /**
     * 按首次访问日期（yyyy-MM-dd）聚合计数。
     */
    @Select("""
            SELECT DATE(first_visit_time) AS dim, COUNT(*) AS cnt
            FROM visitor
            WHERE deleted = 0
              AND first_visit_time IS NOT NULL
              AND (#{start} IS NULL OR first_visit_time >= #{start})
              AND (#{end} IS NULL OR first_visit_time <= #{end})
            GROUP BY DATE(first_visit_time)
            """)
    List<Map<String, Object>> countByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT country AS dim, COUNT(*) AS cnt
            FROM visitor
            WHERE deleted = 0
              AND country IS NOT NULL AND country != ''
              AND (#{start} IS NULL OR first_visit_time >= #{start})
              AND (#{end} IS NULL OR first_visit_time <= #{end})
            GROUP BY country
            """)
    List<Map<String, Object>> countByCountry(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT city AS dim, COUNT(*) AS cnt
            FROM visitor
            WHERE deleted = 0
              AND city IS NOT NULL AND city != ''
              AND (#{start} IS NULL OR first_visit_time >= #{start})
              AND (#{end} IS NULL OR first_visit_time <= #{end})
            GROUP BY city
            """)
    List<Map<String, Object>> countByCity(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT device_type AS dim, COUNT(*) AS cnt
            FROM visitor
            WHERE deleted = 0
              AND device_type IS NOT NULL AND device_type != ''
              AND (#{start} IS NULL OR first_visit_time >= #{start})
              AND (#{end} IS NULL OR first_visit_time <= #{end})
            GROUP BY device_type
            """)
    List<Map<String, Object>> countByDeviceType(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT browser_name AS dim, COUNT(*) AS cnt
            FROM visitor
            WHERE deleted = 0
              AND browser_name IS NOT NULL AND browser_name != ''
              AND (#{start} IS NULL OR first_visit_time >= #{start})
              AND (#{end} IS NULL OR first_visit_time <= #{end})
            GROUP BY browser_name
            """)
    List<Map<String, Object>> countByBrowserName(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Select("""
            SELECT os_name AS dim, COUNT(*) AS cnt
            FROM visitor
            WHERE deleted = 0
              AND os_name IS NOT NULL AND os_name != ''
              AND (#{start} IS NULL OR first_visit_time >= #{start})
              AND (#{end} IS NULL OR first_visit_time <= #{end})
            GROUP BY os_name
            """)
    List<Map<String, Object>> countByOsName(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

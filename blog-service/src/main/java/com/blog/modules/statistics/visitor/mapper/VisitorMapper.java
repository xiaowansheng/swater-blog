package com.blog.modules.statistics.visitor.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.statistics.visitor.model.entity.Visitor;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
                referer_url = VALUES(referer_url),
                traffic_source = VALUES(traffic_source),
                search_engine = VALUES(search_engine),
                search_keywords = VALUES(search_keywords),
                utm_source = VALUES(utm_source),
                utm_medium = VALUES(utm_medium),
                utm_campaign = VALUES(utm_campaign),
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
            @Param("now") LocalDateTime now
    );
}

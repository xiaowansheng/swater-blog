package com.blog.shared.util;

import com.blog.shared.model.UserAgentInfo;
import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.util.StringUtils;

/**
 * User-Agent 解析工具类
 */
public class UserAgentUtil {

    private static final UserAgentAnalyzer UA_ANALYZER = UserAgentAnalyzer
            .newBuilder()
            .withCache(1000)
            .hideMatcherLoadStats()
            .build();

    private UserAgentUtil() {
    }

    /**
     * 解析 User-Agent 字符串
     *
     * @param userAgent User-Agent 字符串
     * @return 解析后的信息
     */
    public static UserAgentInfo parse(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return UserAgentInfo.builder().build();
        }
        try {
            UserAgent ua = UA_ANALYZER.parse(userAgent);
            String deviceType = getValue(ua, "DeviceClass");
            String deviceBrand = getValue(ua, "DeviceBrand");
            String deviceModel = getValue(ua, "DeviceName");
            String osName = getValue(ua, "OperatingSystemName");
            String osVersion = buildVersion(
                    getValue(ua, "OperatingSystemVersionMajor"),
                    getValue(ua, "OperatingSystemVersionMinor"),
                    getValue(ua, "OperatingSystemVersionPatch"));
            String browserName = getValue(ua, "AgentName");
            String browserVersion = buildVersion(
                    getValue(ua, "AgentVersionMajor"),
                    getValue(ua, "AgentVersionMinor"),
                    getValue(ua, "AgentVersionPatch"));
            return UserAgentInfo.builder()
                    .deviceType(deviceType)
                    .deviceBrand(deviceBrand)
                    .deviceModel(deviceModel)
                    .osName(osName)
                    .osVersion(osVersion)
                    .browserName(browserName)
                    .browserVersion(browserVersion)
                    .build();
        } catch (Exception e) {
            return UserAgentInfo.builder().build();
        }
    }

    /**
     * 从当前请求解析 User-Agent
     *
     * @return 解析后的信息
     */
    public static UserAgentInfo parseFromRequest() {
        String userAgent = RequestUtil.getUserAgent();
        return parse(userAgent);
    }

    private static String getValue(UserAgent ua, String key) {
        String value = ua.getValue(key);
        return StringUtils.hasText(value) ? value : null;
    }

    private static String buildVersion(String major, String minor, String patch) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(major)) {
            sb.append(major);
        }
        if (StringUtils.hasText(minor)) {
            if (!sb.isEmpty()) {
                sb.append(".");
            }
            sb.append(minor);
        }
        if (StringUtils.hasText(patch)) {
            if (!sb.isEmpty()) {
                sb.append(".");
            }
            sb.append(patch);
        }
        return sb.isEmpty() ? null : sb.toString();
    }
}

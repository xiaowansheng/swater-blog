package com.blog.shared.util.ua;

import com.blog.shared.model.UserAgentInfo;
import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.util.StringUtils;

/**
 * 基于 Yauaa 的 User-Agent 解析器
 */
public class YauaaUserAgentParser implements UserAgentParser {

    private final UserAgentAnalyzer analyzer;

    public YauaaUserAgentParser() {
        this.analyzer = UserAgentAnalyzer
                .newBuilder()
                .withCache(1000)
                .hideMatcherLoadStats()
                .withField("DeviceClass")
                .withField("DeviceBrand")
                .withField("DeviceName")
                .withField("OperatingSystemName")
                .withField("OperatingSystemVersionMajor")
                .withField("OperatingSystemVersionMinor")
                .withField("OperatingSystemVersionPatch")
                .withField("AgentName")
                .withField("AgentVersionMajor")
                .withField("AgentVersionMinor")
                .withField("AgentVersionPatch")
                .build();
    }

    @Override
    public UserAgentInfo parse(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return UserAgentInfo.builder().build();
        }
        try {
            UserAgent ua = analyzer.parse(userAgent);
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

    private String getValue(UserAgent ua, String key) {
        String value = ua.getValue(key);
        return StringUtils.hasText(value) ? value : null;
    }

    private String buildVersion(String major, String minor, String patch) {
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(major)) {
            sb.append(major);
        }
        if (StringUtils.hasText(minor)) {
            if (sb.length() > 0) {
                sb.append(".");
            }
            sb.append(minor);
        }
        if (StringUtils.hasText(patch)) {
            if (sb.length() > 0) {
                sb.append(".");
            }
            sb.append(patch);
        }
        return sb.length() > 0 ? sb.toString() : null;
    }
}

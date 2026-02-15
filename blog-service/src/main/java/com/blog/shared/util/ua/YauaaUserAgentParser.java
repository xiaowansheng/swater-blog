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
                .withField("OperatingSystemVersion")
                .withField("AgentName")
                .withField("AgentVersion")
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
            String osVersion = getValue(ua, "OperatingSystemVersion");
            String browserName = getValue(ua, "AgentName");
            String browserVersion = getValue(ua, "AgentVersion");
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

package com.blog.shared.util.ua;

import com.blog.shared.model.UserAgentInfo;
import org.springframework.util.StringUtils;
import ua_parser.Client;
import ua_parser.Parser;

/**
 * 基于 uap-java 的 User-Agent 解析器
 */
public class UapJavaUserAgentParser implements UserAgentParser {

    private final Parser parser;

    public UapJavaUserAgentParser() {
        this.parser = new Parser();
    }

    @Override
    public UserAgentInfo parse(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return UserAgentInfo.builder().build();
        }
        try {
            Client client = parser.parse(userAgent);

            String deviceType = "Desktop"; // Default
            String deviceBrand = client.device.brand;
            String deviceModel = client.device.model;
            
            // 简单的设备类型推断，uap-java 对设备类型的支持不如 Yauaa
            if ("Spider".equals(client.device.family)) {
                deviceType = "Robot";
            } else if (userAgent.contains("Mobile") || userAgent.contains("Android") || userAgent.contains("iPhone")) {
                deviceType = "Phone";
            } else if (userAgent.contains("iPad") || userAgent.contains("Tablet")) {
                deviceType = "Tablet";
            }

            String osName = client.os.family;
            String osVersion = buildVersion(client.os.major, client.os.minor, client.os.patch);

            String browserName = client.userAgent.family;
            String browserVersion = buildVersion(client.userAgent.major, client.userAgent.minor, client.userAgent.patch);

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

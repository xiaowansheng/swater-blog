package com.blog.shared.model;

import lombok.Builder;
import lombok.Data;

/**
 * User-Agent 解析信息
 */
@Data
@Builder
public class UserAgentInfo {
    /**
     * 设备类型（Phone/Tablet/Desktop）
     */
    private String deviceType;

    /**
     * 设备品牌（Apple/Samsung/Xiaomi等）
     */
    private String deviceBrand;

    /**
     * 设备型号
     */
    private String deviceModel;

    /**
     * 操作系统名称（Android/iOS/Windows等）
     */
    private String osName;

    /**
     * 操作系统版本
     */
    private String osVersion;

    /**
     * 浏览器名称（Chrome/Firefox/Safari等）
     */
    private String browserName;

    /**
     * 浏览器版本
     */
    private String browserVersion;

    /**
     * 获取设备描述（品牌+型号）
     */
    public String getDeviceDescription() {
        StringBuilder sb = new StringBuilder();
        if (deviceBrand != null && !deviceBrand.isEmpty()) {
            sb.append(deviceBrand);
        }
        if (deviceModel != null && !deviceModel.isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(deviceModel);
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    /**
     * 获取操作系统描述（名称+版本）
     */
    public String getOsDescription() {
        StringBuilder sb = new StringBuilder();
        if (osName != null && !osName.isEmpty()) {
            sb.append(osName);
        }
        if (osVersion != null && !osVersion.isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(osVersion);
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    /**
     * 获取浏览器描述（名称+版本）
     */
    public String getBrowserDescription() {
        StringBuilder sb = new StringBuilder();
        if (browserName != null && !browserName.isEmpty()) {
            sb.append(browserName);
        }
        if (browserVersion != null && !browserVersion.isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(browserVersion);
        }
        return sb.length() > 0 ? sb.toString() : null;
    }
}

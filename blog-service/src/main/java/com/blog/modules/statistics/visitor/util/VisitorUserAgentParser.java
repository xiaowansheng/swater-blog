package com.blog.modules.statistics.visitor.util;


import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.UserAgentUtil;

/**
 * @deprecated 使用 {@link UserAgentUtil} 替代
 */
@Deprecated
public class VisitorUserAgentParser {

    private VisitorUserAgentParser() {
    }

    /**
     * @deprecated 使用 {@link UserAgentUtil#parse(String)} 替代
     */
    @Deprecated
    public static VisitorUserAgentInfo parse(String userAgent) {
        UserAgentInfo info = UserAgentUtil.parse(userAgent);
        return VisitorUserAgentInfo.builder()
                .deviceType(info.getDeviceType())
                .deviceBrand(info.getDeviceBrand())
                .deviceModel(info.getDeviceModel())
                .osName(info.getOsName())
                .osVersion(info.getOsVersion())
                .browserName(info.getBrowserName())
                .browserVersion(info.getBrowserVersion())
                .build();
    }
}

package com.blog.shared.util;

import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.ua.UserAgentParser;
import com.blog.shared.util.ua.YauaaUserAgentParser;

/**
 * User-Agent 解析工具类
 * <p>
 * 支持多种解析策略，通过 UserAgentConfig 进行配置
 */
public class UserAgentUtil {

    private static volatile UserAgentParser parser;

    private UserAgentUtil() {
    }

    /**
     * 设置解析器策略
     */
    public static void setParser(UserAgentParser parser) {
        UserAgentUtil.parser = parser;
    }

    private static UserAgentParser getParser() {
        if (parser == null) {
            synchronized (UserAgentUtil.class) {
                if (parser == null) {
                    // 默认使用 Yauaa 实现，保证在非 Spring 环境下也能工作
                    parser = new YauaaUserAgentParser();
                }
            }
        }
        return parser;
    }

    /**
     * 解析 User-Agent 字符串
     *
     * @param userAgent User-Agent 字符串
     * @return 解析后的信息
     */
    public static UserAgentInfo parse(String userAgent) {
        return getParser().parse(userAgent);
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
}

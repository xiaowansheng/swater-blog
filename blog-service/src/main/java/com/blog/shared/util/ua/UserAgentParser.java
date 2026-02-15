package com.blog.shared.util.ua;

import com.blog.shared.model.UserAgentInfo;

/**
 * User-Agent 解析器接口
 */
public interface UserAgentParser {
    /**
     * 解析 User-Agent 字符串
     *
     * @param userAgent User-Agent 字符串
     * @return 解析后的信息
     */
    UserAgentInfo parse(String userAgent);
}

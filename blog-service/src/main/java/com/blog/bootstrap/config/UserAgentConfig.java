package com.blog.bootstrap.config;

import com.blog.shared.util.UserAgentUtil;
import com.blog.shared.util.ua.UserAgentParser;
import com.blog.shared.util.ua.YauaaUserAgentParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class UserAgentConfig {

    @Bean
    public UserAgentParser userAgentParser() {
        log.info("初始化 User-Agent 解析器（yauaa）");
        UserAgentParser parser = new YauaaUserAgentParser();
        // 将解析器注入到静态工具类中
        UserAgentUtil.setParser(parser);
        return parser;
    }
}

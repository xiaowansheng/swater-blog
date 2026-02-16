package com.blog.bootstrap.config;

import com.blog.shared.util.UserAgentUtil;
import com.blog.shared.util.ua.UapJavaUserAgentParser;
import com.blog.shared.util.ua.UserAgentParser;
import com.blog.shared.util.ua.YauaaUserAgentParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class UserAgentConfig {

    @Value("${user-agent.parser:yauaa}")
    private String parserType;

    @Bean
    public UserAgentParser userAgentParser() {
        log.info("初始化 User-Agent 解析器，类型: {}", parserType);
        UserAgentParser parser;
        if ("uap-java".equalsIgnoreCase(parserType)) {
            parser = new UapJavaUserAgentParser();
        } else {
            // 默认为 yauaa
            parser = new YauaaUserAgentParser();
        }
        
        // 将解析器注入到静态工具类中
        UserAgentUtil.setParser(parser);
        
        return parser;
    }
}

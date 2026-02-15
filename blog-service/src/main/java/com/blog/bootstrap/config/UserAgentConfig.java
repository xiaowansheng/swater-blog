package com.blog.bootstrap.config;

import com.blog.shared.util.UserAgentUtil;
import com.blog.shared.util.ua.UapJavaUserAgentParser;
import com.blog.shared.util.ua.UserAgentParser;
import com.blog.shared.util.ua.YauaaUserAgentParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Slf4j
@Configuration
public class UserAgentConfig {

    @Value("${plugin.user-agent.active:uap-java}")
    private String parserType;

    @Bean
    public UserAgentParser userAgentParser() {
        log.info("初始化 User-Agent 解析器，类型: {}", parserType);
        if ("uap-java".equalsIgnoreCase(parserType)) {
            return new UapJavaUserAgentParser();
        }
        // 默认为 yauaa
        return new YauaaUserAgentParser();
    }

    @PostConstruct
    public void init() {
        // 将 Spring 管理的 Parser 注入到静态工具类中
        UserAgentUtil.setParser(userAgentParser());
    }
}

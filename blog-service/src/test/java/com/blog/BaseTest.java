package com.blog;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

/**
 * 测试基础类
 * 提供Spring Boot测试环境和通用配置
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = BlogApplication.class)
@ActiveProfiles("test")
@Transactional
public abstract class BaseTest {
    
    // 通用测试方法可以在这里定义
    
}
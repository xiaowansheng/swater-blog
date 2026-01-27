plugins {
    java
    // 使用 Kotlin 2.0.x，保持与 Spring Boot 3.4.x 的最佳兼容性
    kotlin("jvm") version "2.0.21"
    // Spring Boot 3.x 线的最新稳定版
    id("org.springframework.boot") version "3.4.1"
    id("io.spring.dependency-management") version "1.1.7"
    jacoco
}

group = "com.blog"
version = "1.0.0"

java {
    // 保持 Java 21 LTS
    sourceCompatibility = JavaVersion.VERSION_21
}

repositories {
    maven { url = uri("https://maven.aliyun.com/repository/public") }
    maven { url = uri("https://maven.aliyun.com/repository/spring") }
    maven { url = uri("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/") }
    mavenCentral()
}

// 强制版本策略：彻底解决 SnakeYAML 冲突
configurations.all {
    resolutionStrategy {
        // 强制使用 2.3 版本，修复安全漏洞并统一全库依赖
        force("org.yaml:snakeyaml:2.3")
    }
}



dependencies {
    // --- 1. 在 dependencies 顶部建议加上 BOM 管理 ---
    implementation(platform("com.baomidou:mybatis-plus-bom:3.5.10.1"))

    // --- Spring Boot Starters (版本由插件自动管理) ---
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-aop")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-amqp")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-quartz")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    // --- 数据库与 ORM (Spring Boot 3 专版) ---
    implementation("com.mysql:mysql-connector-j:9.1.0")
    implementation("com.baomidou:mybatis-plus-spring-boot3-starter")
    // --- MyBatis-Plus 分页解析扩展  ---
    implementation("com.baomidou:mybatis-plus-jsqlparser")
    implementation("com.baomidou:mybatis-plus-generator")

    // --- 安全认证 (Sa-Token 最新版) ---
    implementation("cn.dev33:sa-token-spring-boot3-starter:1.39.0")
    implementation("cn.dev33:sa-token-redis-jackson:1.39.0")

    // --- 搜索与监控 ---
    // implementation("org.springframework.boot:spring-boot-starter-data-elasticsearch")
    // implementation("co.elastic.clients:elasticsearch-java")
    implementation("io.micrometer:micrometer-registry-prometheus")
    implementation("io.github.mweirauch:micrometer-jvm-extras:0.2.2")
    implementation("nl.basjes.parse.useragent:yauaa:7.23.0")

    // --- API文档工具 (SpringDoc OpenAPI 最新版) ---
    // 2.8.x 是目前的黄金版本，完美适配 Spring Boot 3.4.x
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.1")

    // --- 核心工具类 (升级到 2025 年最新安全版本) ---
    implementation("org.apache.commons:commons-lang3:3.17.0")
    implementation("cn.hutool:hutool-all:5.8.35") // 修复了所有已知高危漏洞
    implementation("org.jsoup:jsoup:1.18.3")
    implementation("com.rometools:rome:2.1.0")

    // --- 敏感词处理 ---
    implementation("com.github.houbb:sensitive-word:0.29.4")

    // --- PDF 导出库 ---

    // 第三方 SDK
    implementation("com.aliyun.oss:aliyun-sdk-oss:3.17.4")
    implementation("com.qiniu:qiniu-java-sdk:7.13.1")
    implementation("com.ip2location:ip2location-java:8.10.0")

    // --- 编译辅助 ---
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // --- 测试相关 (排除冲突，强制版本控制) ---
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:mysql")
    // testImplementation("org.testcontainers:elasticsearch")
    testImplementation("org.testcontainers:rabbitmq")
    testImplementation("com.h2database:h2")

    // 使用 Datafaker 替代已停更的 JavaFaker
    testImplementation("net.datafaker:datafaker:2.4.2")
    testImplementation("org.assertj:assertj-core")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// --- 任务优化配置 ---

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "21"
        freeCompilerArgs = listOf("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    // Java 21 环境下必须开启，否则 Mockito 可能会报错
    jvmArgs("-XX:+EnableDynamicAgentLoading")
    // finalizedBy(tasks.jacocoTestReport)
    enabled = true
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

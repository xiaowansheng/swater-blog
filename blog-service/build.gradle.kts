plugins {
    java
    kotlin("jvm") version "2.0.21"
    id("org.springframework.boot") version "3.4.0"
    id("io.spring.dependency-management") version "1.1.6"
}

group = "com.blog"
version = "1.0.0"

java {
    sourceCompatibility = JavaVersion.VERSION_21
}

repositories {
    // 添加国内镜像仓库
    maven { url = uri("https://maven.aliyun.com/repository/public") }
    maven { url = uri("https://maven.aliyun.com/repository/spring") }
    maven { url = uri("https://maven.aliyun.com/repository/central") }
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-aop")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-amqp")
    
    implementation("com.baomidou:mybatis-plus-boot-starter:3.5.7")
    implementation("com.baomidou:mybatis-plus-generator:3.5.7")
    
    implementation("cn.dev33:sa-token-spring-boot3-starter:1.38.0")
    implementation("cn.dev33:sa-token-redis-jackson:1.38.0")
    
    implementation("org.springframework.boot:spring-boot-starter-data-elasticsearch")
    implementation("co.elastic.clients:elasticsearch-java")

    implementation("org.springframework.boot:spring-boot-starter-quartz")
    
    // API文档 - 升级到SpringDoc OpenAPI 3.0
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.2.0")
    implementation("org.springdoc:springdoc-openapi-starter-common:2.2.0")
    
    // 移除旧的Springfox依赖
    // implementation("io.springfox:springfox-boot-starter:3.0.0")
    
    implementation("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    
    implementation("com.mysql:mysql-connector-j:9.1.0")
    
    implementation("org.apache.commons:commons-lang3:3.17.0")
    implementation("cn.hutool:hutool-all:5.8.28")
    
    implementation("com.aliyun.oss:aliyun-sdk-oss:3.17.4")
    implementation("com.qiniu:qiniu-java-sdk:7.13.1")
    implementation("com.ip2location:ip2location-java:8.10.0")
    
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    
    implementation("com.rometools:rome:2.1.0")
    
    implementation("org.jsoup:jsoup:1.17.2")
    
    // 性能监控
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")
    implementation("io.github.mweirauch:micrometer-jvm-extras:0.2.2")
    
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    
    // TestContainers - 集成测试
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:mysql")
    testImplementation("org.testcontainers:elasticsearch")
    testImplementation("org.testcontainers:rabbitmq")
    
    // 内存数据库 - 单元测试
    testImplementation("com.h2database:h2")
    
    // 测试工具
    testImplementation("com.github.javafaker:javafaker:1.0.2")
    testImplementation("org.assertj:assertj-core")
}

tasks.withType<Test> {
    useJUnitPlatform()
    
    // 测试报告配置
    testLogging {
        events("passed", "skipped", "failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
    
    // JVM参数
    jvmArgs("-XX:+EnableDynamicAgentLoading")
    
    // 测试结果报告
    finalizedBy(tasks.jacocoTestReport)
}

// 代码覆盖率
apply(plugin = "jacoco")

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
    
    executionData.setFrom(fileTree(layout.buildDirectory.dir("jacoco")).include("**/*.exec"))
}

tasks.jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                minimum = "0.80".toBigDecimal()
            }
        }
    }
}
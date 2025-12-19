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
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
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
    
    implementation("org.quartz-scheduler:quartz:2.3.3")
    
    implementation("io.springfox:springfox-boot-starter:3.0.0")
    
    implementation("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    
    implementation("com.mysql:mysql-connector-j:9.1.0")
    
    implementation("org.apache.commons:commons-lang3:3.17.0")
    implementation("cn.hutool:hutool-all:5.8.28")
    
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}


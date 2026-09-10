package com.blog;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Flyway 迁移冒烟测试：在真实 MySQL（Testcontainers）上从零执行 V1 基线，
 * 验证 32 张业务表完整建出，且 flyway_schema_history 正常记录。
 * 这是 build.gradle.kts 中 Testcontainers 依赖的第一个实际用例。
 */
@Testcontainers
class FlywayMigrationSmokeTest {

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("blog")
            .withUsername("blog")
            .withPassword("blog");

    @Test
    void baselineMigrationCreatesAllTables() throws Exception {
        Flyway.configure()
                .dataSource(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword())
                .locations("classpath:db/migration")
                .load()
                .migrate();

        try (Connection conn = DriverManager.getConnection(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword());
             ResultSet rs = conn.createStatement().executeQuery(
                     "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'blog'")) {
            rs.next();
            int tableCount = rs.getInt(1);
            assertThat(tableCount)
                    .as("V1 基线应建出全部业务表（schema 定义 32 张）")
                    .isGreaterThanOrEqualTo(32);
        }

        try (Connection conn = DriverManager.getConnection(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword());
             ResultSet rs = conn.createStatement().executeQuery(
                     "SELECT version, description, success FROM flyway_schema_history")) {
            assertThat(rs.next()).isTrue();
            assertThat(rs.getString("version")).isEqualTo("1");
            assertThat(rs.getInt("success")).isEqualTo(1);
        }
    }
}

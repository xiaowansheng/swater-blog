# 测试指南

## 概述

本项目采用分层测试策略，包括单元测试、集成测试和端到端测试，确保代码质量和系统稳定性。

## 测试框架

- **JUnit 5** - 测试框架
- **Spring Boot Test** - Spring集成测试
- **TestContainers** - 容器化集成测试
- **Mockito** - Mock框架
- **AssertJ** - 断言库
- **JavaFaker** - 测试数据生成
- **H2** - 内存数据库（单元测试）

## 测试分类

### 1. 单元测试 (70%)

**目标**: 测试单个类或方法的功能
**位置**: `src/test/java/com/blog/service/`, `src/test/java/com/blog/util/`
**特点**:
- 使用H2内存数据库
- Mock外部依赖
- 快速执行

**示例**:
```java
@DisplayName("文章管理命令服务测试")
class ArticleAdminCommandServiceTest extends BaseTest {
    
    @Test
    @DisplayName("创建文章 - 成功")
    void createArticle_Success() {
        // Given - 准备测试数据
        // When - 执行测试方法
        // Then - 验证结果
    }
}
```

### 2. 集成测试 (20%)

**目标**: 测试多个组件之间的交互
**位置**: `src/test/java/com/blog/controller/`, `src/test/java/com/blog/integration/`
**特点**:
- 使用TestContainers提供真实环境
- 测试完整的请求-响应流程
- 包含数据库、缓存、消息队列

**示例**:
```java
@DisplayName("文章管理控制器测试")
class ArticleAdminControllerTest extends BaseWebTest {
    
    @Test
    @DisplayName("获取文章列表 - 成功")
    void getArticleList_Success() throws Exception {
        mockMvc.perform(get("/api/admin/post/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
```

### 3. 端到端测试 (10%)

**目标**: 测试完整的业务流程
**位置**: `src/test/java/com/blog/e2e/`
**特点**:
- 模拟真实用户操作
- 测试完整业务场景
- 验证系统集成

## 测试配置

### 测试环境配置

**单元测试**: `application-test.yml`
- H2内存数据库
- 嵌入式Redis
- Mock外部服务

**集成测试**: `application-integration-test.yml`
- TestContainers MySQL
- TestContainers Redis
- TestContainers RabbitMQ
- TestContainers Elasticsearch

### 测试基础类

**BaseTest**: 单元测试基础类
```java
@SpringBootTest(classes = BlogApplication.class)
@ActiveProfiles("test")
@Transactional
public abstract class BaseTest {
    // 通用测试配置
}
```

**BaseWebTest**: Web层测试基础类
```java
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
public abstract class BaseWebTest {
    protected MockMvc mockMvc;
    protected ObjectMapper objectMapper;
}
```

**BaseIntegrationTest**: 集成测试基础类
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("integration-test")
@Testcontainers
public abstract class BaseIntegrationTest {
    // TestContainers配置
}
```

## 测试数据管理

### TestDataFactory

使用工厂模式生成测试数据：

```java
@Component
public class TestDataFactory {
    private final Faker faker = new Faker(Locale.CHINA);
    
    public User createUser() {
        // 生成测试用户
    }
    
    public Article createArticle() {
        // 生成测试文章
    }
}
```

### 测试数据特点

- 使用JavaFaker生成随机数据
- 数据符合业务规则
- 支持中文数据
- 可重复生成

## 运行测试

### 命令行运行

```bash
# 运行所有测试
./gradlew test

# 运行单元测试
./gradlew test --tests "com.blog.service.*" --tests "com.blog.util.*"

# 运行集成测试
./gradlew test --tests "com.blog.controller.*"

# 生成测试报告
./gradlew jacocoTestReport

# 检查代码覆盖率
./gradlew jacocoTestCoverageVerification
```

### 使用脚本运行

**Windows**:
```cmd
run-tests.bat
```

**Linux/Mac**:
```bash
chmod +x run-tests.sh
./run-tests.sh
```

### IDE运行

- **IntelliJ IDEA**: 右键点击测试类或方法，选择"Run"
- **Eclipse**: 右键点击测试类，选择"Run As" -> "JUnit Test"

## 测试报告

### 测试结果报告

位置: `build/reports/tests/test/index.html`

包含:
- 测试执行结果
- 成功/失败统计
- 执行时间
- 失败详情

### 代码覆盖率报告

位置: `build/reports/jacoco/test/html/index.html`

包含:
- 行覆盖率
- 分支覆盖率
- 方法覆盖率
- 类覆盖率

### 覆盖率要求

- **总体覆盖率**: ≥ 80%
- **Service层**: ≥ 90%
- **Util层**: ≥ 95%
- **Controller层**: ≥ 70%

## 测试最佳实践

### 1. 测试命名

```java
// 好的命名
@Test
@DisplayName("创建文章 - 标题为空应该失败")
void createArticle_EmptyTitle_ShouldFail() {}

// 不好的命名
@Test
void test1() {}
```

### 2. 测试结构

使用Given-When-Then模式：

```java
@Test
void createArticle_Success() {
    // Given - 准备测试数据
    ArticleCreateDTO createDTO = new ArticleCreateDTO();
    createDTO.setTitle("测试标题");
    
    // When - 执行测试方法
    Long articleId = articleService.createArticle(createDTO, userId);
    
    // Then - 验证结果
    assertThat(articleId).isNotNull();
}
```

### 3. 断言使用

优先使用AssertJ：

```java
// 推荐
assertThat(result).isNotNull();
assertThat(list).hasSize(3);
assertThat(article.getTitle()).isEqualTo("测试标题");

// 不推荐
assertTrue(result != null);
assertEquals(3, list.size());
```

### 4. 异常测试

```java
@Test
void createArticle_EmptyTitle_ShouldFail() {
    assertThatThrownBy(() -> 
        articleService.createArticle(emptyTitleDTO, userId)
    ).isInstanceOf(IllegalArgumentException.class)
     .hasMessageContaining("标题不能为空");
}
```

### 5. 参数化测试

```java
@ParameterizedTest
@ValueSource(strings = {"", " ", "  "})
void encode_EmptyPassword_ShouldFail(String emptyPassword) {
    assertThatThrownBy(() -> PasswordUtil.encode(emptyPassword))
            .isInstanceOf(IllegalArgumentException.class);
}
```

## 持续集成

### GitHub Actions配置

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '21'
      - run: ./gradlew test jacocoTestReport
      - uses: codecov/codecov-action@v3
```

### 测试策略

1. **每次提交**: 运行单元测试
2. **Pull Request**: 运行完整测试套件
3. **发布前**: 运行所有测试 + 性能测试
4. **定期**: 运行端到端测试

## 故障排除

### 常见问题

1. **TestContainers启动失败**
   - 检查Docker是否运行
   - 检查端口是否被占用
   - 增加容器启动超时时间

2. **数据库连接失败**
   - 检查数据库配置
   - 确认测试数据库已创建
   - 检查连接池配置

3. **测试数据冲突**
   - 使用@Transactional回滚
   - 清理测试数据
   - 使用随机数据

### 调试技巧

1. **启用SQL日志**:
   ```yaml
   logging:
     level:
       org.mybatis: DEBUG
   ```

2. **查看测试容器日志**:
   ```java
   @Container
   static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
           .withLogConsumer(new Slf4jLogConsumer(log));
   ```

3. **保留测试数据**:
   ```java
   @Test
   @Rollback(false) // 不回滚，保留数据用于调试
   void debugTest() {}
   ```

## 总结

完善的测试体系是保证代码质量的重要手段。通过分层测试、自动化测试和持续集成，我们可以：

- 提高代码质量
- 减少Bug数量
- 增强重构信心
- 提升开发效率
- 保证系统稳定性

请严格按照测试规范编写测试用例，确保测试覆盖率达到要求。
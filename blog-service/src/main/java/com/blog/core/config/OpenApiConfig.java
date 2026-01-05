package com.blog.core.config;



import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Arrays;
import java.util.List;
/**
 * OpenAPI 3.0 配置
 * 提供完整的API文档配置
 */
@Configuration
public class OpenApiConfig {
    
    @Value("${spring.application.name:blog-service}")
    private String applicationName;
    
    @Value("${server.servlet.context-path:}")
    private String contextPath;
    
    @Bean
    public OpenAPI blogOpenAPI() {
        return new OpenAPI()
                .info(createApiInfo())
                .servers(createServers())
                .addSecurityItem(createSecurityRequirement())
                .components(createComponents())
                .tags(createTags());
    }
    
    /**
     * 创建API信息
     */
    private Info createApiInfo() {
        return new Info()
                .title("Blog API Documentation")
                .description("""
                    ## 个人博客系统API文档
                    
                    这是一个功能完整的个人博客系统API，提供以下主要功能：
                    
                    ### 核心功能
                    - 📝 **文章管理**: 文章的创建、编辑、发布、删除
                    - 💬 **评论系统**: 支持嵌套评论、评论审核
                    - 🏷️ **分类标签**: 文章分类和标签管理
                    - 👤 **用户管理**: 用户注册、登录、权限管理
                    - 📊 **统计分析**: 访问统计、数据分析
                    
                    ### 技术特性
                    - 🔒 **安全防护**: 限流、SQL注入防护、XSS防护
                    - 📈 **性能监控**: 实时监控、指标收集
                    - 💾 **缓存优化**: 多级缓存、Redis集群
                    - 🔍 **全文搜索**: Elasticsearch集成
                    
                    ### 认证说明
                    大部分API需要Bearer Token认证，请先调用登录接口获取token。
                    
                    ### 限流说明
                    API实施了智能限流策略，请合理控制请求频率。
                    """)
                .version("v1.0.0")
                .contact(new Contact()
                        .name("Blog Team")
                        .email("admin@blog.com")
                        .url("https://github.com/your-username/blog"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }
    
    /**
     * 创建服务器列表
     */
    private List<Server> createServers() {
        return Arrays.asList(
                new Server()
                        .url("http://localhost:8888" + contextPath)
                        .description("开发环境"),
                new Server()
                        .url("https://api.yourblog.com" + contextPath)
                        .description("生产环境"),
                new Server()
                        .url("https://test-api.yourblog.com" + contextPath)
                        .description("测试环境")
        );
    }
    
    /**
     * 创建安全要求
     */
    private SecurityRequirement createSecurityRequirement() {
        return new SecurityRequirement().addList("bearerAuth");
    }
    
    /**
     * 创建组件配置
     */
    private Components createComponents() {
        return new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("请输入Bearer Token，格式：Bearer {token}"))
                .addSecuritySchemes("apiKey", new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.HEADER)
                        .name("X-API-Key")
                        .description("API密钥认证"));
    }
    
    /**
     * 创建标签分组
     */
    private List<Tag> createTags() {
        return Arrays.asList(
                new Tag().name("认证管理").description("用户认证相关接口"),
                new Tag().name("文章管理").description("文章的增删改查操作"),
                new Tag().name("评论管理").description("评论系统相关接口"),
                new Tag().name("分类管理").description("文章分类管理"),
                new Tag().name("标签管理").description("文章标签管理"),
                new Tag().name("用户管理").description("用户信息管理"),
                new Tag().name("文件管理").description("文件上传下载"),
                new Tag().name("系统管理").description("系统配置和管理"),
                new Tag().name("统计分析").description("数据统计和分析"),
                new Tag().name("搜索功能").description("全文搜索接口"),
                new Tag().name("公开接口").description("无需认证的公开接口"),
                new Tag().name("监控接口").description("系统监控和健康检查"),
                new Tag().name("安全测试").description("安全功能测试接口")
        );
    }
}
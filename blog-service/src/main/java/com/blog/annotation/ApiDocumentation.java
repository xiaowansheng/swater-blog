package com.blog.annotation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * API文档注解集合
 * 提供常用的API文档注解组合
 */
public class ApiDocumentation {
    
    /**
     * 标准的成功响应
     */
    @Target({ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "操作成功",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "code": 200,
                          "message": "success",
                          "data": {},
                          "timestamp": 1640995200000
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "请求参数错误",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "code": 400,
                          "message": "参数校验失败",
                          "timestamp": 1640995200000
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "未授权",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "code": 401,
                          "message": "未登录或token已过期",
                          "timestamp": 1640995200000
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "权限不足",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "code": 403,
                          "message": "权限不足",
                          "timestamp": 1640995200000
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "429",
            description = "请求过于频繁",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "code": 429,
                          "message": "请求过于频繁，请稍后再试",
                          "timestamp": 1640995200000
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "服务器内部错误",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "code": 500,
                          "message": "服务器内部错误",
                          "timestamp": 1640995200000
                        }
                        """
                )
            )
        )
    })
    public @interface StandardApiResponses {
    }
    
    /**
     * 分页查询响应
     */
    @Target({ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponse(
        responseCode = "200",
        description = "查询成功",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = """
                    {
                      "code": 200,
                      "message": "success",
                      "data": {
                        "records": [],
                        "total": 100,
                        "size": 10,
                        "current": 1,
                        "pages": 10
                      },
                      "timestamp": 1640995200000
                    }
                    """
            )
        )
    )
    public @interface PagedApiResponse {
    }
    
    /**
     * 需要认证的接口
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @SecurityRequirement(name = "bearerAuth")
    public @interface RequireAuth {
    }
    
    /**
     * 管理员接口
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @SecurityRequirement(name = "bearerAuth")
    @Tag(name = "管理接口", description = "需要管理员权限")
    public @interface AdminApi {
    }
    
    /**
     * 公开接口
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Tag(name = "公开接口", description = "无需认证")
    public @interface PublicApi {
    }
    
    /**
     * 分页参数
     */
    @Target({ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @Parameter(
        name = "current",
        description = "当前页码",
        in = ParameterIn.QUERY,
        schema = @Schema(type = "integer", defaultValue = "1", minimum = "1")
    )
    @Parameter(
        name = "size",
        description = "每页大小",
        in = ParameterIn.QUERY,
        schema = @Schema(type = "integer", defaultValue = "10", minimum = "1", maximum = "100")
    )
    public @interface PageParams {
    }
    
    /**
     * 排序参数
     */
    @Target({ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @Parameter(
        name = "sortBy",
        description = "排序字段",
        in = ParameterIn.QUERY,
        schema = @Schema(type = "string", defaultValue = "createTime")
    )
    @Parameter(
        name = "sortOrder",
        description = "排序方向",
        in = ParameterIn.QUERY,
        schema = @Schema(type = "string", defaultValue = "desc", allowableValues = {"asc", "desc"})
    )
    public @interface SortParams {
    }
    
    /**
     * 搜索参数
     */
    @Target({ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    @Parameter(
        name = "keyword",
        description = "搜索关键词",
        in = ParameterIn.QUERY,
        schema = @Schema(type = "string")
    )
    public @interface SearchParams {
    }
}
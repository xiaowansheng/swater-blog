package com.blog.annotation;


import com.blog.model.enums.ApiOperationType;

import java.lang.annotation.*;

/**
 * 标注在控制器方法上的API操作注解。
 * 用于自动初始化接口权限数据，定义方法级别的操作信息。
 *
 * 典型用途：
 * - 自动创建系统API接口节点
 * - 自动生成权限标识
 * - 初始化接口操作基础数据
 */
@Documented
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiOperation {

    /** 操作唯一标识（英文标识），如：create、update、delete、list等 */
    String value();

    /** 操作显示名称（中文或可读名称），如：创建文章、更新用户、删除权限 */
    String name();

    /** 操作类型（建议优先使用枚举） */
    ApiOperationType type() default ApiOperationType.OTHER;

    /** HTTP请求方法（GET、POST、PUT、DELETE等） */
    HttpMethod method() default HttpMethod.UNKNOWN;

    /** 接口路径（相对于控制器基础路径） */
    String[] path() default {""};

    /** 完整接口路径（包含控制器基础路径） */
    String fullPath() default "";

    /** 权限标识（如：system:article:create，为空时自动生成） */
    String perms() default "";

    /** 操作状态：ENABLED-启用，DISABLED-禁用 */
    boolean open() default false;

    /** 操作描述 */
    String description() default "";

    /** 操作标签 */
    String[] tags() default {};

    String version() default "1.0.0";

    /** 是否记录操作日志 */
    boolean logOperation() default true;

    /** 是否记录异常日志 */
    boolean logException() default true;

    /**
     * HTTP请求方法枚举
     */
    enum HttpMethod {
        /** GET请求 */
        GET("GET"),
        /** POST请求 */
        POST("POST"),
        /** PUT请求 */
        PUT("PUT"),
        /** DELETE请求 */
        DELETE("DELETE"),
        /** PATCH请求 */
        PATCH("PATCH"),
        /** HEAD请求 */
        HEAD("HEAD"),
        /** OPTIONS请求 */
        OPTIONS("OPTIONS"),
        /** TRACE请求 */
        TRACE("TRACE"),
        /** 未知请求方法 */
        UNKNOWN("UNKNOWN");

        private final String value;

        HttpMethod(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return value;
        }
    }

//    /**
//     * 操作状态枚举
//     */
//    enum OperationStatus {
//        /** 启用 */
//        ENABLED,
//        /** 禁用 */
//        DISABLED
//    }
}

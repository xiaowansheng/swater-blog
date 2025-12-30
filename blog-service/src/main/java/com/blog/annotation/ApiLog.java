package com.blog.annotation;

import com.wbxnl.blog.common.enums.ApiOperationType;

import java.lang.annotation.*;

/**
 * 标注在控制器方法上的操作日志/异常日志元信息注解。
 *
 * 典型映射关系（用于 AOP 采集日志数据时补充静态元信息）：
 * - type        → OperationLogCommand.type
 * - description → OperationLogCommand.description
 * - name        → 仅用于展示或报表
 * - record*     → 是否采集对应字段
 */
@Documented
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiLog {

    /** 操作类型（建议优先使用枚举） */
    ApiOperationType op() default ApiOperationType.OTHER;

    /** 操作类型字符串（用于与历史或动态值兼容，若同时设置，优先使用枚举） */
    String type() default "";

    /** 中文名称（如：创建文章） */
    String name() default "";

    /** 描述信息（如：创建文章并发布） */
    String description() default "";

    // /** 异常类型（当触发异常时用于分类统计） */
    // ApiExceptionType exceptionType() default ApiExceptionType.UNKNOWN;

    /** 是否记录请求参数 */
    boolean recordRequest() default true;

    /** 是否记录响应数据 */
    boolean recordResponse() default true;

    /** 是否记录耗时（切面内计算并写入 elapsedTime） */
    boolean recordElapsedTime() default true;

    /** 是否记录客户端信息（IP/设备/浏览器） */
    boolean recordClient() default true;

    /** 是否启用（可快速关闭该接口的日志采集） */
    boolean enabled() default true;
}



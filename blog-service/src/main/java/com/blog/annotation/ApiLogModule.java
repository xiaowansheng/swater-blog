package com.blog.annotation;

import java.lang.annotation.*;

/**
 * 标注在控制器类上的模块注解。
 *
 * 典型映射关系（用于 AOP 采集日志数据时补充静态元信息）：
 * - module → OperationLogCommand.module / ExceptionLogCommand.module
 * - name   → 仅用于展示或报表
 * - version → OperationLogCommand.version / ExceptionLogCommand.version
 * - tags   → 可用于自定义分类或过滤
 */
@Documented
@Inherited
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiLogModule {

    /** 模块唯一标识（英文标识），如：article、permission、user 等 */
    String value();

    /** 模块显示名称（中文或可读名称），如：文章管理、权限管理 */
    String name() default "";

    /** 接口所属版本或应用版本，便于定位问题来源 */
    String version() default "";

    /** 自定义标签 */
    String[] tags() default {};

    /** 是否启用（可用于灰度关闭某些切面采集） */
    boolean enabled() default true;
}



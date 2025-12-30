package com.blog.annotation;

import java.lang.annotation.*;

/**
 * description: 略
 *
 * @author xiaowansheng
 * @since 2024/8/19 16:12
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
@Documented
public @interface ResponseResult {
}

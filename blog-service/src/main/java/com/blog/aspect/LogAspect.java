package com.blog.aspect;

import com.blog.annotation.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LogAspect {

    @Around("@annotation(apiOperation)")
    public Object around(ProceedingJoinPoint point, ApiOperation apiOperation) throws Throwable {
        long startTime = System.currentTimeMillis();
        try {
            Object result = point.proceed();
            long endTime = System.currentTimeMillis();
            log.info("操作: {}, 耗时: {}ms", apiOperation.type(), endTime - startTime);
            return result;
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            log.error("操作: {} 失败, 耗时: {}ms", apiOperation.type(), endTime - startTime, e);
            throw e;
        }
    }
}


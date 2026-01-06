package com.blog.infrastructure.aspect;



import com.blog.shared.annotation.ApiOperation;
import com.blog.bootstrap.context.UserContext;
import com.blog.modules.system.log.model.entity.LogError;
import com.blog.modules.system.log.model.entity.LogOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.system.log.service.LogErrorService;
import com.blog.modules.system.log.service.LogOperationService;
import com.blog.shared.util.IpUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Method;
/**
 * 日志切面 - 记录操作日志和异常日志
 *
 * 功能：
 * 1. 拦截带有 @ApiOperation 注解的 Controller 方法
 * 2. 排除 GET 查询请求（只记录数据变更操作）
 * 3. 记录成功操作到 log_operation 表
 * 4. 记录异常信息到 log_error 表
 */
@Slf4j
@Aspect
@Component
public class LogAspect {

    @Autowired
    private LogOperationService logOperationService;

    @Autowired
    private LogErrorService logErrorService;

    @Around("@annotation(apiOperation)")
    public Object around(ProceedingJoinPoint point, ApiOperation apiOperation) throws Throwable {
        long startTime = System.currentTimeMillis();

        // 获取请求信息
        HttpServletRequest request = RequestUtil.getRequest();
        if (request == null) {
            // 如果没有请求上下文，直接执行目标方法
            return point.proceed();
        }

        String requestMethod = request.getMethod();
        String requestUri = request.getRequestURI();
        String ip = IpUtil.getClientIp(request);

        // 判断是否需要记录日志
        // 1. 检查是否是 GET 请求（GET 请求不记录）
        // 2. 检查是否是 QUERY 类型（查询类型不记录）
        // 3. 检查注解的 logOperation 属性
        boolean isGetRequest = "GET".equalsIgnoreCase(requestMethod);
        boolean isQueryType = apiOperation.type() == ApiOperationType.QUERY;
        boolean shouldLogOperation = apiOperation.logOperation();

        if (isGetRequest || isQueryType || !shouldLogOperation) {
            // 不记录日志，直接执行
            return point.proceed();
        }

        // 准备日志数据
        LogOperation logOperation = null;
        String username = null;
        Long userId = null;

        try {
            // 获取当前用户信息
            if (UserContext.isLoggedIn()) {
                try {
                    userId = UserContext.getCurrentUserId();
                    username = UserContext.getCurrentUser().getUsername();
                } catch (Exception e) {
                    // 获取用户信息失败，继续执行
                    log.warn("获取当前用户信息失败: {}", e.getMessage());
                }
            }

            // 构建操作日志对象
            logOperation = buildLogOperation(point, apiOperation, request, userId, username, ip, startTime);

            // 执行目标方法
            Object result = point.proceed();

            // 计算执行时间
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // 更新操作日志（成功）
            logOperation.setDuration(duration);
            logOperation.setElapsedTime(duration);
            logOperation.setStatus(1); // 1-成功
            if (result != null) {
                try {
                    // 限制响应数据长度，避免数据过大
                    String responseData = JsonUtil.toJson(result);
                    if (responseData != null && responseData.length() > 5000) {
                        responseData = responseData.substring(0, 5000) + "...";
                    }
                    logOperation.setResponseData(responseData);
                    logOperation.setResult("SUCCESS");
                } catch (Exception e) {
                    logOperation.setResult("SUCCESS");
                }
            } else {
                logOperation.setResult("SUCCESS");
            }

            // 异步保存操作日志
            try {
                logOperationService.save(logOperation);
            } catch (Exception e) {
                log.error("保存操作日志失败", e);
            }

            log.info("操作日志: 用户={}, 操作={}, 耗时={}ms", username, apiOperation.name(), duration);
            return result;

        } catch (Exception e) {
            // 计算执行时间
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // 构建异常日志
            LogError logError = buildLogError(point, apiOperation, request, userId, username, ip, e, duration);

            // 更新操作日志（失败）
            if (logOperation != null) {
                logOperation.setDuration(duration);
                logOperation.setElapsedTime(duration);
                logOperation.setStatus(0); // 0-失败
                logOperation.setErrorMsg(e.getMessage());
                logOperation.setResult("FAILED");

                // 异步保存操作日志
                try {
                    logOperationService.save(logOperation);
                } catch (Exception ex) {
                    log.error("保存操作日志失败", ex);
                }
            }

            // 异步保存异常日志
            if (apiOperation.logException()) {
                try {
                    logErrorService.save(logError);
                } catch (Exception ex) {
                    log.error("保存异常日志失败", ex);
                }
            }

            log.error("异常日志: 用户={}, 操作={}, 耗时={}ms, 异常={}",
                    username, apiOperation.name(), duration, e.getMessage(), e);

            // 重新抛出异常
            throw e;
        }
    }

    /**
     * 构建操作日志对象
     */
    private LogOperation buildLogOperation(ProceedingJoinPoint point, ApiOperation apiOperation,
                                           HttpServletRequest request, Long userId, String username,
                                           String ip, long startTime) {
        LogOperation logOperation = new LogOperation();

        // 用户信息
        logOperation.setUserId(userId);
        logOperation.setUsername(username);

        // 操作信息
        logOperation.setOperation(apiOperation.name());
        logOperation.setType(apiOperation.type().name());
        logOperation.setDescription(apiOperation.description());
        logOperation.setModule(apiOperation.name());

        // 请求信息
        logOperation.setRequestUrl(request.getRequestURI());
        logOperation.setRequestMethod(request.getMethod());
        logOperation.setPath(request.getRequestURI());
        logOperation.setIp(ip);

        // 方法信息
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();

        // method 存储 HTTP 方法（GET/POST/PUT/DELETE）
        logOperation.setMethod(request.getMethod());

        // calling_method 存储完整的 Java 方法签名（包名 + 类名 + 方法名）
        String fullMethod = method.getDeclaringClass().getName() + "." + method.getName();
        logOperation.setCallingMethod(fullMethod);

        // 请求参数
        try {
            Object[] args = point.getArgs();
            if (args != null && args.length > 0) {
                String params = JsonUtil.toJson(args);
                // 限制参数长度，避免数据过大
                if (params != null && params.length() > 2000) {
                    params = params.substring(0, 2000) + "...";
                }
                logOperation.setRequestParam(params);
                logOperation.setParams(params);
            }
        } catch (Exception e) {
            log.warn("序列化请求参数失败", e);
        }

        return logOperation;
    }

    /**
     * 构建异常日志对象
     */
    private LogError buildLogError(ProceedingJoinPoint point, ApiOperation apiOperation,
                                   HttpServletRequest request, Long userId, String username,
                                   String ip, Exception e, long duration) {
        LogError logError = new LogError();

        // 用户信息
        logError.setUserId(userId);
        logError.setUsername(username);

        // 异常信息
        logError.setExceptionType(e.getClass().getName());
        logError.setExceptionMsg(e.getMessage());
        logError.setErrorName(e.getClass().getSimpleName());
        logError.setErrorMessage(e.getMessage());

        // 堆栈跟踪
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        String stackTrace = sw.toString();
        // 限制堆栈跟踪长度
        if (stackTrace.length() > 10000) {
            stackTrace = stackTrace.substring(0, 10000) + "...";
        }
        logError.setStackTrace(stackTrace);

        // 操作信息
        logError.setModule(apiOperation.name());

        // 请求信息
        logError.setRequestUrl(request.getRequestURI());
        logError.setRequestMethod(request.getMethod());
        logError.setPath(request.getRequestURI());
        logError.setIp(ip);

        // 方法信息
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();

        // method 存储 HTTP 方法（GET/POST/PUT/DELETE）
        logError.setMethod(request.getMethod());

        // calling_method 存储完整的 Java 方法签名（包名 + 类名 + 方法名）
        String fullMethod = method.getDeclaringClass().getName() + "." + method.getName();
        // 限制方法名长度，避免超过数据库字段长度
        if (fullMethod.length() > 500) {
            fullMethod = fullMethod.substring(0, 500);
        }
        logError.setCallingMethod(fullMethod);

        // 请求参数
        try {
            Object[] args = point.getArgs();
            if (args != null && args.length > 0) {
                String params = JsonUtil.toJson(args);
                // 限制参数长度
                if (params != null && params.length() > 2000) {
                    params = params.substring(0, 2000) + "...";
                }
                logError.setRequestParam(params);
                logError.setParams(params);
            }
        } catch (Exception ex) {
            log.warn("序列化请求参数失败", ex);
        }

        return logError;
    }
}


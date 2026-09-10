package com.blog.bootstrap.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Value("${async.event.core-pool-size:8}")
    private int corePoolSize;

    @Value("${async.event.max-pool-size:32}")
    private int maxPoolSize;

    @Value("${async.event.queue-capacity:1000}")
    private int queueCapacity;

    @Value("${async.event.await-termination-seconds:60}")
    private int awaitTerminationSeconds;

    @Value("${async.webhook.core-pool-size:2}")
    private int webhookCorePoolSize;

    @Value("${async.webhook.max-pool-size:4}")
    private int webhookMaxPoolSize;

    @Value("${async.webhook.queue-capacity:200}")
    private int webhookQueueCapacity;

    @Bean(name = "eventTaskExecutor")
    public Executor eventTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("event-async-");
        // 回压策略：队列满时由调用线程执行，避免任务直接丢失
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);
        executor.initialize();
        return executor;
    }

    /**
     * webhook 专用线程池：webhook 发送含 HTTP 阻塞 + 固定 sleep 重试（最长可达数十秒），
     * 与业务事件隔离，避免慢 webhook 占满共享事件池、把反压传导到请求线程。
     */
    @Bean(name = "webhookTaskExecutor")
    public Executor webhookTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(webhookCorePoolSize);
        executor.setMaxPoolSize(webhookMaxPoolSize);
        executor.setQueueCapacity(webhookQueueCapacity);
        executor.setThreadNamePrefix("webhook-async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);
        executor.initialize();
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        return eventTaskExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new AsyncUncaughtExceptionHandler() {
            @Override
            public void handleUncaughtException(Throwable ex, Method method, Object... params) {
                log.error("Async method failed: method={}, params={}", method.getName(), Arrays.toString(params), ex);
            }
        };
    }
}

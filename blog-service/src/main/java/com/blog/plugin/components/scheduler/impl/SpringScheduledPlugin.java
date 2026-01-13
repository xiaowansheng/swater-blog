package com.blog.plugin.components.scheduler.impl;



import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.scheduler.SchedulerPlugin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.scheduler.active", havingValue = "spring", matchIfMissing = true)
public class SpringScheduledPlugin implements SchedulerPlugin, Plugin {
    
    private final TaskScheduler taskScheduler;
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    
    public SpringScheduledPlugin() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("spring-scheduled-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(60);
        scheduler.initialize();
        this.taskScheduler = scheduler;
    }
    
    @Override
    public String getName() {
        return "spring";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public Object schedule(String taskName, Runnable task, String cronExpression) throws Exception {
        // Spring的TaskScheduler不支持Cron表达式，需要使用ScheduledAnnotationBeanPostProcessor
        // 这里简化处理，使用固定延迟
        log.warn("Spring Scheduled不支持Cron表达式，任务 {} 将不会执行", taskName);
        return null;
    }
    
    @Override
    public Object scheduleWithFixedDelay(String taskName, Runnable task, long initialDelay, long delay) throws Exception {
        java.time.Instant startTime = java.time.Instant.now().plusMillis(initialDelay);
        ScheduledFuture<?> future = taskScheduler.scheduleWithFixedDelay(task, 
                startTime,
                java.time.Duration.ofMillis(delay));
        scheduledTasks.put(taskName, future);
        log.info("已添加固定延迟任务: {}, 初始延迟: {}ms, 延迟间隔: {}ms", taskName, initialDelay, delay);
        return future;
    }
    
    @Override
    public Object scheduleAtFixedRate(String taskName, Runnable task, long initialDelay, long period) throws Exception {
        java.time.Instant startTime = java.time.Instant.now().plusMillis(initialDelay);
        ScheduledFuture<?> future = taskScheduler.scheduleAtFixedRate(task,
                startTime,
                java.time.Duration.ofMillis(period));
        scheduledTasks.put(taskName, future);
        log.info("已添加固定频率任务: {}, 初始延迟: {}ms, 执行周期: {}ms", taskName, initialDelay, period);
        return future;
    }
    
    @Override
    public void cancel(Object taskId) throws Exception {
        if (taskId instanceof ScheduledFuture) {
            ((ScheduledFuture<?>) taskId).cancel(false);
        }
    }
    
    @Override
    public void pause(String taskName) throws Exception {
        ScheduledFuture<?> future = scheduledTasks.get(taskName);
        if (future != null) {
            future.cancel(false);
            log.info("已暂停任务: {}", taskName);
        }
    }
    
    @Override
    public void resume(String taskName) throws Exception {
        // Spring Scheduled不支持恢复，需要重新创建任务
        log.warn("Spring Scheduled不支持恢复任务，任务 {} 需要重新创建", taskName);
    }
}


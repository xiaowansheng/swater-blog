package com.blog.plugin.components.scheduler.impl;



import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.scheduler.SchedulerPlugin;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import java.util.Properties;
@Slf4j
@Component
@ConditionalOnProperty(name = "scheduler.provider.type", havingValue = "quartz")
public class QuartzSchedulerPlugin implements SchedulerPlugin, Plugin {
    
    private Scheduler scheduler;
    
    public QuartzSchedulerPlugin() {
        try {
            StdSchedulerFactory factory = new StdSchedulerFactory();
            Properties props = new Properties();
            props.put("org.quartz.scheduler.instanceName", "BlogScheduler");
            props.put("org.quartz.scheduler.instanceId", "AUTO");
            props.put("org.quartz.threadPool.class", "org.quartz.simpl.SimpleThreadPool");
            props.put("org.quartz.threadPool.threadCount", "10");
            props.put("org.quartz.threadPool.threadPriority", "5");
            factory.initialize(props);
            this.scheduler = factory.getScheduler();
            this.scheduler.start();
            log.info("Quartz调度器已启动");
        } catch (SchedulerException e) {
            log.error("初始化Quartz调度器失败", e);
        }
    }
    
    @Override
    public String getName() {
        return "quartz";
    }
    
    @Override
    public boolean isEnabled() {
        try {
            return scheduler != null && scheduler.isStarted();
        } catch (SchedulerException e) {
            return false;
        }
    }
    
    @Override
    public Object schedule(String taskName, Runnable task, String cronExpression) throws Exception {
        if (!isEnabled()) {
            throw new IllegalStateException("Quartz调度器未启用");
        }
        
        JobDetail jobDetail = JobBuilder.newJob(QuartzRunnableJob.class)
                .withIdentity(taskName, "default")
                .usingJobData("taskName", taskName)
                .build();
        
        CronTrigger trigger = TriggerBuilder.newTrigger()
                .withIdentity(taskName + "_trigger", "default")
                .withSchedule(CronScheduleBuilder.cronSchedule(cronExpression))
                .build();
        
        scheduler.scheduleJob(jobDetail, trigger);
        log.info("已添加Cron任务: {}, Cron表达式: {}", taskName, cronExpression);
        return jobDetail.getKey();
    }
    
    @Override
    public Object scheduleWithFixedDelay(String taskName, Runnable task, long initialDelay, long delay) throws Exception {
        if (!isEnabled()) {
            throw new IllegalStateException("Quartz调度器未启用");
        }
        
        JobDetail jobDetail = JobBuilder.newJob(QuartzRunnableJob.class)
                .withIdentity(taskName, "default")
                .usingJobData("taskName", taskName)
                .build();
        
        SimpleTrigger trigger = TriggerBuilder.newTrigger()
                .withIdentity(taskName + "_trigger", "default")
                .startAt(new java.util.Date(System.currentTimeMillis() + initialDelay))
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInMilliseconds(delay)
                        .repeatForever())
                .build();
        
        scheduler.scheduleJob(jobDetail, trigger);
        log.info("已添加固定延迟任务: {}, 初始延迟: {}ms, 延迟间隔: {}ms", taskName, initialDelay, delay);
        return jobDetail.getKey();
    }
    
    @Override
    public Object scheduleAtFixedRate(String taskName, Runnable task, long initialDelay, long period) throws Exception {
        // Quartz的SimpleTrigger默认就是固定频率
        return scheduleWithFixedDelay(taskName, task, initialDelay, period);
    }
    
    @Override
    public void cancel(Object taskId) throws Exception {
        if (!isEnabled()) {
            return;
        }
        
        if (taskId instanceof JobKey) {
            scheduler.deleteJob((JobKey) taskId);
        }
    }
    
    @Override
    public void pause(String taskName) throws Exception {
        if (!isEnabled()) {
            return;
        }
        
        JobKey jobKey = JobKey.jobKey(taskName, "default");
        scheduler.pauseJob(jobKey);
        log.info("已暂停任务: {}", taskName);
    }
    
    @Override
    public void resume(String taskName) throws Exception {
        if (!isEnabled()) {
            return;
        }
        
        JobKey jobKey = JobKey.jobKey(taskName, "default");
        scheduler.resumeJob(jobKey);
        log.info("已恢复任务: {}", taskName);
    }
    
    /**
     * Quartz Job包装类，用于执行Runnable任务
     */
    public static class QuartzRunnableJob implements Job {
        // 注意：Quartz Job需要通过JobDataMap传递Runnable，这里简化处理
        // 实际使用时需要将Runnable存储在可访问的地方（如静态Map或Spring Bean）
        @Override
        public void execute(JobExecutionContext context) throws JobExecutionException {
            String taskName = context.getJobDetail().getJobDataMap().getString("taskName");
            log.warn("Quartz任务执行需要实现Runnable存储机制，任务名称: {}", taskName);
        }
    }
}


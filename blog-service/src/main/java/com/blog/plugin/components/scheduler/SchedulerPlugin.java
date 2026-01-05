package com.blog.plugin.components.scheduler;


import com.blog.plugin.core.Plugin;

/**
 * 定时任务调度插件接口
 */
public interface SchedulerPlugin extends Plugin {
    /**
     * 添加定时任务
     * @param taskName 任务名称
     * @param task 任务执行逻辑（Runnable）
     * @param cronExpression Cron表达式
     * @return 任务ID或Future对象
     */
    Object schedule(String taskName, Runnable task, String cronExpression) throws Exception;
    
    /**
     * 添加固定延迟任务
     * @param taskName 任务名称
     * @param task 任务执行逻辑
     * @param initialDelay 初始延迟（毫秒）
     * @param delay 延迟间隔（毫秒）
     * @return 任务ID或Future对象
     */
    Object scheduleWithFixedDelay(String taskName, Runnable task, long initialDelay, long delay) throws Exception;
    
    /**
     * 添加固定频率任务
     * @param taskName 任务名称
     * @param task 任务执行逻辑
     * @param initialDelay 初始延迟（毫秒）
     * @param period 执行周期（毫秒）
     * @return 任务ID或Future对象
     */
    Object scheduleAtFixedRate(String taskName, Runnable task, long initialDelay, long period) throws Exception;
    
    /**
     * 取消任务
     * @param taskId 任务ID或Future对象
     */
    void cancel(Object taskId) throws Exception;
    
    /**
     * 暂停任务
     * @param taskName 任务名称
     */
    void pause(String taskName) throws Exception;
    
    /**
     * 恢复任务
     * @param taskName 任务名称
     */
    void resume(String taskName) throws Exception;
}


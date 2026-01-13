package com.blog.shared.util;

import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * 事件发布工具类
 * 提供事务后事件发布的统一方法
 */
public class EventUtil {

    /**
     * 在事务提交后执行指定的操作
     * 如果当前没有活跃的事务，则立即执行
     * 
     * @param runnable 要执行的操作
     */
    public static void publishEventAfterCommit(Runnable runnable) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                    runnable.run();
                }
            });
        } else {
            runnable.run();
        }
    }
}
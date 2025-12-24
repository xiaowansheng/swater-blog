package com.blog.plugin.mq.impl;

import com.blog.plugin.core.Plugin;
import com.blog.plugin.mq.MessageQueuePlugin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
@ConditionalOnMissingBean(RabbitTemplate.class)
public class MemoryMQPlugin implements MessageQueuePlugin, Plugin {
    
    private final ConcurrentHashMap<String, BlockingQueue<Object>> queues = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<MessageListener>> listeners = new ConcurrentHashMap<>();
    private final ExecutorService executorService = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "memory-mq-consumer");
        t.setDaemon(true);
        return t;
    });
    private final AtomicBoolean running = new AtomicBoolean(true);
    
    @PostConstruct
    public void init() {
        log.info("内存MQ插件已启动（RabbitMQ未配置）");
    }
    
    @PreDestroy
    public void destroy() {
        running.set(false);
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(5, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }
        log.info("内存MQ插件已关闭");
    }
    
    @Override
    public String getName() {
        return "memory";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public void send(String exchange, String routingKey, Object message) throws Exception {
        String queueKey = exchange + "." + routingKey;
        BlockingQueue<Object> queue = queues.computeIfAbsent(queueKey, k -> new LinkedBlockingQueue<>());
        queue.offer(message);
        notifyListeners(queueKey, message);
    }
    
    @Override
    public void sendToQueue(String queue, Object message) throws Exception {
        BlockingQueue<Object> queueInstance = queues.computeIfAbsent(queue, k -> new LinkedBlockingQueue<>());
        queueInstance.offer(message);
        notifyListeners(queue, message);
    }
    
    @Override
    public void sendDelayed(String exchange, String routingKey, Object message, long delayMillis) throws Exception {
        executorService.submit(() -> {
            try {
                Thread.sleep(delayMillis);
                send(exchange, routingKey, message);
            } catch (Exception e) {
                log.error("延迟消息发送失败", e);
            }
        });
    }
    
    public void addListener(String queue, MessageListener listener) {
        listeners.computeIfAbsent(queue, k -> new CopyOnWriteArrayList<>()).add(listener);
        startConsumer(queue);
    }
    
    public BlockingQueue<Object> getQueue(String queue) {
        return queues.computeIfAbsent(queue, k -> new LinkedBlockingQueue<>());
    }
    
    private void notifyListeners(String queueKey, Object message) {
        CopyOnWriteArrayList<MessageListener> queueListeners = listeners.get(queueKey);
        if (queueListeners != null && !queueListeners.isEmpty()) {
            for (MessageListener listener : queueListeners) {
                executorService.submit(() -> {
                    try {
                        listener.onMessage(message);
                    } catch (Exception e) {
                        log.error("消息监听器处理失败", e);
                    }
                });
            }
        }
    }
    
    private void startConsumer(String queueKey) {
        executorService.submit(() -> {
            BlockingQueue<Object> queue = queues.computeIfAbsent(queueKey, k -> new LinkedBlockingQueue<>());
            while (running.get()) {
                try {
                    Object message = queue.poll(1, TimeUnit.SECONDS);
                    if (message != null) {
                        CopyOnWriteArrayList<MessageListener> queueListeners = listeners.get(queueKey);
                        if (queueListeners != null) {
                            for (MessageListener listener : queueListeners) {
                                try {
                                    listener.onMessage(message);
                                } catch (Exception e) {
                                    log.error("消息监听器处理失败", e);
                                }
                            }
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("消息消费失败", e);
                }
            }
        });
    }
    
    public interface MessageListener {
        void onMessage(Object message) throws Exception;
    }
}


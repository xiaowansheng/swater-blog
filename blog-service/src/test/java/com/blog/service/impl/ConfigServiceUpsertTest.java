package com.blog.service.impl;

import com.blog.BaseTest;
import com.blog.model.dto.ConfigDTO;
import com.blog.model.vo.ConfigVO;
import com.blog.service.ConfigService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class ConfigServiceUpsertTest extends BaseTest {

    @Autowired
    private ConfigService configService;

    @Test
    public void testUpsertInsert() {
        String key = "test_key_" + UUID.randomUUID().toString().substring(0, 8);
        ConfigDTO dto = new ConfigDTO();
        dto.setName("Test Name");
        dto.setValue("Test Value");
        dto.setGroupName("test_group");

        ConfigVO result = configService.updateByKey(key, dto);

        assertEquals(key, result.getConfigKey());
        assertEquals("Test Value", result.getValue());
        assertNotNull(result.getId());
    }

    @Test
    public void testUpsertUpdate() {
        // First insert
        String key = "test_key_" + UUID.randomUUID().toString().substring(0, 8);
        ConfigDTO dto = new ConfigDTO();
        dto.setName("Initial Name");
        dto.setValue("Initial Value");
        dto.setGroupName("test_group");
        configService.updateByKey(key, dto);

        // Then update
        dto.setValue("Updated Value");
        ConfigVO result = configService.updateByKey(key, dto);

        assertEquals(key, result.getConfigKey());
        assertEquals("Updated Value", result.getValue());
    }

    @Test
    public void testConcurrentUpsert() throws InterruptedException {
        String key = "concurrent_key_" + UUID.randomUUID().toString().substring(0, 8);
        int threadCount = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            executorService.execute(() -> {
                try {
                    ConfigDTO dto = new ConfigDTO();
                    dto.setName("Concurrent Name " + index);
                    dto.setValue("Value " + index);
                    dto.setGroupName("concurrent_group");
                    
                    configService.updateByKey(key, dto);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executorService.shutdown();

        assertEquals(threadCount, successCount.get());
        
        // Final check
        ConfigVO finalConfig = configService.getByKey(key);
        assertNotNull(finalConfig);
    }
}

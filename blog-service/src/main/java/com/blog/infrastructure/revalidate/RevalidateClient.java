package com.blog.infrastructure.revalidate;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class RevalidateClient {
    private final RestTemplate restTemplate;

    @Value("${revalidate.url:}")
    private String revalidateUrl;

    @Value("${revalidate.token:}")
    private String revalidateToken;

    public RevalidateClient(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .requestFactory(() -> {
                    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                    factory.setConnectTimeout(Duration.ofSeconds(2));
                    factory.setReadTimeout(Duration.ofSeconds(4));
                    return factory;
                })
                .build();
    }

    public void revalidateTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return;
        }
        if (revalidateUrl == null || revalidateUrl.isBlank()) {
            return;
        }
        if (revalidateToken == null || revalidateToken.isBlank()) {
            return;
        }

        String base = revalidateUrl.endsWith("/") ? revalidateUrl.substring(0, revalidateUrl.length() - 1) : revalidateUrl;
        String endpoint = base + "/api/revalidate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-revalidate-token", revalidateToken);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(Map.of("tags", tags), headers);
        try {
            restTemplate.postForEntity(endpoint, request, String.class);
        } catch (Exception e) {
            log.warn("触发Next.js revalidate失败: url={}, tags={}, error={}", endpoint, tags, e.getMessage());
        }
    }
}

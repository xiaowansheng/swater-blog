package com.blog.infrastructure.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
public class WebhookService {

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${blog.webhook.connect-timeout:5000}")
    private int connectTimeout;

    @Value("${blog.webhook.read-timeout:10000}")
    private int readTimeout;

    @Value("${blog.webhook.max-retries:3}")
    private int maxRetries;

    @Value("${blog.webhook.retry-delay-ms:2000}")
    private long retryDelayMs;

    @Value("${blog.webhook.allowed-schemes:https}")
    private String allowedSchemes;

    /**
     * 在 webhook 专用线程池执行：HTTP 阻塞 + sleep 重试不占用业务事件池。
     * 监听器（eventTaskExecutor）负责配置读取与事件扇出，此处专注慢速投递，两级池即隔离边界。
     */
    @Async("webhookTaskExecutor")
    public void send(String url, String secret, String event, Map<String, Object> payload) {
        if (!com.blog.shared.util.UrlSafetyUtil.isUrlAllowed(url, com.blog.shared.util.UrlSafetyUtil.parseSchemes(allowedSchemes))) {
            log.error("Webhook URL not allowed (scheme or host rejected): url={}", url);
            return;
        }

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String body = buildBody(event, payload);
                String signature = sign(body, secret);

                HttpURLConnection conn = (HttpURLConnection) URI.create(url).toURL().openConnection();
                // SSRF 防护：禁止自动跟随重定向，避免 302 跳转到内网地址
                conn.setInstanceFollowRedirects(false);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                conn.setRequestProperty("X-Webhook-Event", event);
                conn.setRequestProperty("X-Webhook-Signature", "sha256=" + signature);
                conn.setConnectTimeout(connectTimeout);
                conn.setReadTimeout(readTimeout);
                conn.setDoOutput(true);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(body.getBytes(StandardCharsets.UTF_8));
                }

                int status = conn.getResponseCode();
                // 3xx 重定向一律视为失败，防止跳板访问内网
                if (status >= 300 && status < 400) {
                    log.warn("Webhook 返回重定向(已拦截以防范 SSRF): url={}, event={}, status={}, attempt={}/{}",
                            url, event, status, attempt, maxRetries);
                } else if (status >= 200 && status < 300) {
                    log.info("Webhook 发送成功: url={}, event={}, status={}", url, event, status);
                    return;
                } else {
                    log.warn("Webhook 返回非 2xx: url={}, event={}, status={}, attempt={}/{}",
                            url, event, status, attempt, maxRetries);
                }
            } catch (Exception e) {
                log.warn("Webhook 发送失败: url={}, event={}, attempt={}/{}", url, event, attempt, maxRetries, e);
            }

            if (attempt < maxRetries) {
                try { Thread.sleep(retryDelayMs); } catch (InterruptedException ignored) {}
            }
        }
        log.error("Webhook 最终失败: url={}, event={}", url, event);
    }

    private String buildBody(String event, Map<String, Object> payload) throws Exception {
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("event", event);
        body.put("timestamp", Instant.now().toString());
        body.put("data", payload);
        return objectMapper.writeValueAsString(body);
    }

    private String sign(String body, String secret) throws Exception {
        if (secret == null || secret.isEmpty()) return "";
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        byte[] hash = mac.doFinal(body.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
}

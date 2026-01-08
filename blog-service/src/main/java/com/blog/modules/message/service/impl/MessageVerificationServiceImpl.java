package com.blog.modules.message.service.impl;

import com.blog.infrastructure.mail.EmailService;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.shared.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class MessageVerificationServiceImpl implements MessageVerificationService {
    private static final String KEY_PREFIX = "message:email_code:";
    private static final int CODE_LENGTH = 6;
    private static final long CODE_TTL_SECONDS = 300;
    private static final long RESEND_COOLDOWN_SECONDS = 60;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public void sendEmailCode(String email) {
        String key = buildKey(email);
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        if (ttl != null && ttl > (CODE_TTL_SECONDS - RESEND_COOLDOWN_SECONDS)) {
            throw new BusinessException(429, "Email code already sent, please try again later");
        }

        if (!emailService.isConfigured()) {
            throw new BusinessException(500, "Email provider is not configured");
        }

        String code = generateCode();
        redisTemplate.opsForValue().set(key, code, CODE_TTL_SECONDS, TimeUnit.SECONDS);

        String subject = "Message verification code";
        String content = "Your verification code is: " + code + "\nIt expires in 5 minutes.";
        try {
            emailService.sendEmail(email, subject, content);
        } catch (Exception e) {
            log.error("Failed to send verification email", e);
            throw new BusinessException(500, "Failed to send verification email");
        }
    }

    @Override
    public void validateEmailCode(String email, String code) {
        String key = buildKey(email);
        Object stored = redisTemplate.opsForValue().get(key);
        if (stored == null || !stored.toString().equals(code)) {
            throw new BusinessException(400, "Invalid email verification code");
        }
        redisTemplate.delete(key);
    }

    private String buildKey(String email) {
        return KEY_PREFIX + email.trim().toLowerCase();
    }

    private String generateCode() {
        int bound = (int) Math.pow(10, CODE_LENGTH);
        int floor = bound / 10;
        int code = secureRandom.nextInt(bound - floor) + floor;
        return String.valueOf(code);
    }
}

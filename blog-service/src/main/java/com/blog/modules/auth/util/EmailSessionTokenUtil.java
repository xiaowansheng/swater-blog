package com.blog.modules.auth.util;

import cn.hutool.jwt.JWT;
import cn.hutool.jwt.JWTUtil;
import com.blog.modules.auth.config.EmailSessionProperties;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class EmailSessionTokenUtil {
    private EmailSessionTokenUtil() {}

    public static String createToken(String email, EmailSessionProperties props) {
        byte[] secret = requireSecret(props);
        long now = Instant.now().getEpochSecond();
        long exp = now + props.getTtlSeconds();

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", email);
        payload.put("sid", UUID.randomUUID().toString());
        payload.put("iat", now);
        payload.put("exp", exp);

        return JWTUtil.createToken(payload, secret);
    }

    public static boolean verify(String token, EmailSessionProperties props) {
        if (token == null || token.isBlank()) return false;
        if (props == null || props.getSecret() == null || props.getSecret().isBlank()) return false;
        try {
            boolean ok = JWTUtil.verify(token, requireSecret(props));
            if (!ok) return false;
            JWT jwt = JWTUtil.parseToken(token);
            Object expObj = jwt.getPayload("exp");
            if (expObj == null) return false;
            long exp = Long.parseLong(String.valueOf(expObj));
            long now = Instant.now().getEpochSecond();
            return now < exp;
        } catch (Exception e) {
            return false;
        }
    }

    public static String getEmail(String token, EmailSessionProperties props) {
        if (!verify(token, props)) return null;
        JWT jwt = JWTUtil.parseToken(token);
        Object email = jwt.getPayload("email");
        return email != null ? String.valueOf(email) : null;
    }

    private static byte[] requireSecret(EmailSessionProperties props) {
        if (props == null || props.getSecret() == null || props.getSecret().isBlank()) {
            throw new IllegalStateException("AUTH_EMAIL_SESSION_SECRET 未配置");
        }
        return props.getSecret().getBytes(StandardCharsets.UTF_8);
    }
}

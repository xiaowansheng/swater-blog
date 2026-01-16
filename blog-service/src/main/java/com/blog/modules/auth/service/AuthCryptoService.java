package com.blog.modules.auth.service;

import com.blog.modules.auth.model.vo.LoginNonceVO;
import com.blog.shared.exception.BusinessException;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import java.security.spec.MGF1ParameterSpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthCryptoService {
    private static final long NONCE_TTL_SECONDS = 120;
    private static final int NONCE_SIZE_BYTES = 16;

    private final KeyPair keyPair;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, Long> nonceCache = new ConcurrentHashMap<>();

    public AuthCryptoService() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            this.keyPair = keyPairGenerator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException("初始化登录加密失败", e);
        }
    }

    public LoginNonceVO createLoginNonce() {
        String nonce = generateNonce();
        nonceCache.put(nonce, System.currentTimeMillis() + NONCE_TTL_SECONDS * 1000);

        LoginNonceVO vo = new LoginNonceVO();
        vo.setNonce(nonce);
        vo.setPublicKey(getPublicKeyPem());
        vo.setExpiresIn(NONCE_TTL_SECONDS);
        return vo;
    }

    public String decryptPassword(String encryptedBase64, String nonce) {
        if (nonce == null || nonce.isBlank()) {
            throw new BusinessException("登录参数无效");
        }
        if (!consumeNonce(nonce)) {
            throw new BusinessException("登录已过期，请重试");
        }

        try {
            byte[] encryptedBytes = Base64.getDecoder().decode(encryptedBase64);
            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            OAEPParameterSpec oaepParams = new OAEPParameterSpec(
                "SHA-256",
                "MGF1",
                MGF1ParameterSpec.SHA256,
                PSource.PSpecified.DEFAULT
            );
            cipher.init(Cipher.DECRYPT_MODE, keyPair.getPrivate(), oaepParams);
            byte[] plainBytes = cipher.doFinal(encryptedBytes);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new BusinessException("登录解密失败");
        }
    }

    private String generateNonce() {
        byte[] bytes = new byte[NONCE_SIZE_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean consumeNonce(String nonce) {
        Long expireAt = nonceCache.remove(nonce);
        return expireAt != null && expireAt >= System.currentTimeMillis();
    }

    private String getPublicKeyPem() {
        String base64 = Base64.getMimeEncoder(64, "\n".getBytes())
            .encodeToString(keyPair.getPublic().getEncoded());
        return "-----BEGIN PUBLIC KEY-----\n" + base64 + "\n-----END PUBLIC KEY-----";
    }
}

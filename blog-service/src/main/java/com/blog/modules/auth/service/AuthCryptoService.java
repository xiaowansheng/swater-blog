package com.blog.modules.auth.service;

import com.blog.modules.auth.model.vo.LoginNonceVO;
import com.blog.shared.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 登录加密服务（RSA-OAEP + 一次性 nonce）。
 * <p>
 * RSA 密钥对与 nonce 均存于 Redis，多实例部署时所有节点共享同一密钥、
 * nonce 防重放跨节点生效（进程内实现会导致解密随机失败、重放防护失效）。
 * Redis 不可用时降级为进程内密钥 + 进程内 nonce（等同单实例行为）。
 * </p>
 */
@Slf4j
@Service
public class AuthCryptoService {
    private static final int NONCE_SIZE_BYTES = 16;
    private static final String KEYPAIR_KEY = "auth:crypto:keypair";
    private static final String NONCE_KEY_PREFIX = "auth:crypto:nonce:";
    private static final long KEYPAIR_TTL_SECONDS = 86400;

    @Value("${auth.crypto.nonce-ttl-seconds:120}")
    private long nonceTtlSeconds;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    private final SecureRandom secureRandom = new SecureRandom();
    /** Redis 不可用时的进程内兜底密钥（懒生成） */
    private volatile KeyPair fallbackKeyPair;
    /** Redis 不可用时的进程内 nonce 兜底缓存 */
    private final Map<String, Long> fallbackNonceCache = new ConcurrentHashMap<>();

    public LoginNonceVO createLoginNonce() {
        String nonce = generateNonce();
        try {
            Boolean claimed = stringRedisTemplate.opsForValue()
                    .setIfAbsent(NONCE_KEY_PREFIX + nonce, "1", Duration.ofSeconds(nonceTtlSeconds));
            if (!Boolean.TRUE.equals(claimed)) {
                // 碰撞概率可忽略，防御性处理
                throw new BusinessException("系统繁忙，请稍后重试");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Redis 不可用，登录 nonce 降级为进程内实现: {}", e.getMessage());
            fallbackNonceCache.put(nonce, System.currentTimeMillis() + nonceTtlSeconds * 1000);
        }

        LoginNonceVO vo = new LoginNonceVO();
        vo.setNonce(nonce);
        vo.setPublicKey(resolveKeyPair().publicPem());
        vo.setExpiresIn(nonceTtlSeconds);
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
            cipher.init(Cipher.DECRYPT_MODE, resolveKeyPair().keyPair().getPrivate(), oaepParams);
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
        try {
            // GETDEL 原子取回并删除（Redis >= 6.2），保证一次性消费跨实例生效
            String value = stringRedisTemplate.opsForValue().getAndDelete(NONCE_KEY_PREFIX + nonce);
            return value != null;
        } catch (Exception e) {
            Long expireAt = fallbackNonceCache.remove(nonce);
            return expireAt != null && expireAt >= System.currentTimeMillis();
        }
    }

    /**
     * 解析当前生效的密钥对：优先 Redis 共享值（集群一致），不可用时降级进程内生成。
     * 密文解密与公钥下发必须使用同一把密钥，因此每次调用都实时解析，避免轮换窗口错配。
     */
    private ResolvedKeyPair resolveKeyPair() {
        try {
            String stored = stringRedisTemplate.opsForValue().get(KEYPAIR_KEY);
            if (stored != null) {
                return decodeKeyPair(stored);
            }
            KeyPair fresh = generateKeyPair();
            Boolean won = stringRedisTemplate.opsForValue().setIfAbsent(
                    KEYPAIR_KEY, encodeKeyPair(fresh), Duration.ofSeconds(KEYPAIR_TTL_SECONDS));
            if (Boolean.TRUE.equals(won)) {
                return new ResolvedKeyPair(fresh, pem(fresh.getPublic()));
            }
            String winner = stringRedisTemplate.opsForValue().get(KEYPAIR_KEY);
            if (winner != null) {
                return decodeKeyPair(winner);
            }
            throw new IllegalStateException("密钥对读写竞争失败");
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Redis 不可用，登录密钥对降级为进程内生成: {}", e.getMessage());
            KeyPair local = fallbackKeyPair;
            if (local == null) {
                synchronized (this) {
                    if (fallbackKeyPair == null) {
                        fallbackKeyPair = generateKeyPair();
                    }
                    local = fallbackKeyPair;
                }
            }
            KeyPair pair = local;
            return new ResolvedKeyPair(pair, pem(pair.getPublic()));
        }
    }

    private KeyPair generateKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException("初始化登录加密失败", e);
        }
    }

    private static String encodeKeyPair(KeyPair keyPair) {
        return Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded())
                + "|"
                + Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }

    private static ResolvedKeyPair decodeKeyPair(String stored) {
        try {
            String[] parts = stored.split("\\|");
            PrivateKey privateKey = KeyFactory.getInstance("RSA")
                    .generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(parts[0])));
            PublicKey publicKey = KeyFactory.getInstance("RSA")
                    .generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(parts[1])));
            KeyPair keyPair = new KeyPair(publicKey, privateKey);
            return new ResolvedKeyPair(keyPair, pem(publicKey));
        } catch (Exception e) {
            throw new IllegalStateException("解析共享登录密钥失败", e);
        }
    }

    private static String pem(PublicKey publicKey) {
        String base64 = Base64.getMimeEncoder(64, "\n".getBytes())
            .encodeToString(publicKey.getEncoded());
        return "-----BEGIN PUBLIC KEY-----\n" + base64 + "\n-----END PUBLIC KEY-----";
    }

    /** 密钥对及其 PEM 公钥（避免重复编码）。 */
    private record ResolvedKeyPair(KeyPair keyPair, String publicPem) {
    }
}

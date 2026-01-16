package com.blog.modules.auth.model.vo;

import lombok.Data;

@Data
public class LoginNonceVO {
    private String publicKey;
    private String nonce;
    private long expiresIn;
}

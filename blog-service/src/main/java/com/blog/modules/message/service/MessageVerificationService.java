package com.blog.modules.message.service;

public interface MessageVerificationService {
    void sendEmailCode(String email);

    void validateEmailCode(String email, String code);
}

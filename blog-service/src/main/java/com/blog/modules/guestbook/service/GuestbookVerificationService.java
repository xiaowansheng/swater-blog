package com.blog.modules.guestbook.service;

public interface GuestbookVerificationService {
    void sendEmailCode(String email);

    void validateEmailCode(String email, String code);
}

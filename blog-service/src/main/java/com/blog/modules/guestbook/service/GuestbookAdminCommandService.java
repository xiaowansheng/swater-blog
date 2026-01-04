package com.blog.modules.guestbook.service;

public interface GuestbookAdminCommandService {
    void approve(Long id);

    void reject(Long id);

    void delete(Long id);

    void setVisible(Long id, Integer isVisible);
}


package com.blog.event.user;

import com.blog.event.BaseEvent;

public class UserPasswordResetEvent extends BaseEvent {
    private final Long userId;

    public UserPasswordResetEvent(Object source, Long userId) {
        super(source, "USER_PASSWORD_RESET");
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}


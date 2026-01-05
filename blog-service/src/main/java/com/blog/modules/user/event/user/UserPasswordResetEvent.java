package com.blog.modules.user.event.user;


import com.blog.shared.model.event.BaseEvent;
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


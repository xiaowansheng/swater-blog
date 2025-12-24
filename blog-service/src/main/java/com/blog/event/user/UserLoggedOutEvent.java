package com.blog.event.user;

import com.blog.event.BaseEvent;

public class UserLoggedOutEvent extends BaseEvent {
    private final Long userId;

    public UserLoggedOutEvent(Object source, Long userId) {
        super(source, "USER_LOGGED_OUT");
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}


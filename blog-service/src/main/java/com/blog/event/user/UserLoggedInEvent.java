package com.blog.event.user;

import com.blog.event.BaseEvent;

public class UserLoggedInEvent extends BaseEvent {
    private final Long userId;
    private final String ip;

    public UserLoggedInEvent(Object source, Long userId, String ip) {
        super(source, "USER_LOGGED_IN");
        this.userId = userId;
        this.ip = ip;
    }

    public Long getUserId() {
        return userId;
    }

    public String getIp() {
        return ip;
    }
}


package com.blog.modules.user.event.user;


import com.blog.shared.model.event.BaseEvent;
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


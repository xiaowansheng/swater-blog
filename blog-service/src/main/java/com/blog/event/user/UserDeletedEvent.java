package com.blog.event.user;

import com.blog.event.BaseEvent;

public class UserDeletedEvent extends BaseEvent {
    private final Long userId;

    public UserDeletedEvent(Object source, Long userId) {
        super(source, "USER_DELETED");
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}


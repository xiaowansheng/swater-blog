package com.blog.event.user;

import com.blog.event.BaseEvent;
import com.blog.model.entity.User;

public class UserUpdatedEvent extends BaseEvent {
    private final Long userId;
    private final User user;

    public UserUpdatedEvent(Object source, Long userId, User user) {
        super(source, "USER_UPDATED");
        this.userId = userId;
        this.user = user;
    }

    public Long getUserId() {
        return userId;
    }

    public User getUser() {
        return user;
    }
}


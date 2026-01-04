package com.blog.modules.user.event.user;


import com.blog.common.model.event.BaseEvent;
import com.blog.modules.user.model.entity.User;
public class UserCreatedEvent extends BaseEvent {
    private final Long userId;
    private final User user;

    public UserCreatedEvent(Object source, Long userId, User user) {
        super(source, "USER_CREATED");
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


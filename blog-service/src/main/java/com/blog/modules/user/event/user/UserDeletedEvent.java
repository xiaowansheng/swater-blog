package com.blog.modules.user.event.user;


import com.blog.shared.model.event.BaseEvent;
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


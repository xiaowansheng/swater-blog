package com.blog.modules.user.event;

import org.springframework.context.ApplicationEvent;
import com.blog.modules.user.model.entity.User;

/**
 * 用户更新事件
 */
public class UserUpdatedEvent extends ApplicationEvent {
    private final Long userId;
    private final User user;
    
    public UserUpdatedEvent(Object source, Long userId, User user) {
        super(source);
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

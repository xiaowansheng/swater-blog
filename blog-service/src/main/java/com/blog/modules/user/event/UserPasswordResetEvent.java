package com.blog.modules.user.event;

import org.springframework.context.ApplicationEvent;

/**
 * 用户密码重置事件
 */
public class UserPasswordResetEvent extends ApplicationEvent {
    private final Long userId;
    
    public UserPasswordResetEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }
    
    public Long getUserId() {
        return userId;
    }
}

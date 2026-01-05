package com.blog.modules.user.event;

import org.springframework.context.ApplicationEvent;

/**
 * 用户删除事件
 */
public class UserDeletedEvent extends ApplicationEvent {
    private final Long userId;
    
    public UserDeletedEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }
    
    public Long getUserId() {
        return userId;
    }
}

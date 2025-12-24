package com.blog.event.user;

import com.blog.event.BaseEvent;
import java.util.List;

public class UserRolesAssignedEvent extends BaseEvent {
    private final Long userId;
    private final List<Long> roleIds;

    public UserRolesAssignedEvent(Object source, Long userId, List<Long> roleIds) {
        super(source, "USER_ROLES_ASSIGNED");
        this.userId = userId;
        this.roleIds = roleIds;
    }

    public Long getUserId() {
        return userId;
    }

    public List<Long> getRoleIds() {
        return roleIds;
    }
}


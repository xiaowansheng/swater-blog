package com.blog.shared.model.event;


import lombok.Getter;
import org.springframework.context.ApplicationEvent;
@Getter
public abstract class BaseEvent extends ApplicationEvent {
    private final String operationType;

    public BaseEvent(Object source, String operationType) {
        super(source);
        this.operationType = operationType;
    }
}


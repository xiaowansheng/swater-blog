package com.blog.modules.notification.model.message;


import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;
@Data
public class NotificationMessage implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String type;
    private Long userId;
    private String title;
    private String content;
    private LocalDateTime timestamp;
    private Map<String, Object> data;
}


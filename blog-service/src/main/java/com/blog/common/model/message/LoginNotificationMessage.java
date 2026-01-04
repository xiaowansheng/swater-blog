package com.blog.common.model.message;


import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
@Data
public class LoginNotificationMessage implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String type;
    private Long userId;
    private String username;
    private String ip;
    private String device;
    private LocalDateTime timestamp;
}


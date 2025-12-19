package com.blog.model.message;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class CommentNotificationMessage implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String type;
    private Long commentId;
    private Long postId;
    private Long momentId;
    private Long commenterId;
    private String commenterName;
    private String commentContent;
    private String postTitle;
    private Long authorId;
    private LocalDateTime timestamp;
}


package com.blog.modules.comment.event;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.comment.model.entity.Comment;
public class CommentCreatedEvent extends BaseEvent {
    private final Long commentId;
    private final Comment comment;

    public CommentCreatedEvent(Object source, Long commentId, Comment comment) {
        super(source, "COMMENT_CREATED");
        this.commentId = commentId;
        this.comment = comment;
    }

    public Long getCommentId() {
        return commentId;
    }

    public Comment getComment() {
        return comment;
    }
}


package com.blog.event.comment;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Comment;

public class CommentUpdatedEvent extends BaseEvent {
    private final Long commentId;
    private final Comment comment;

    public CommentUpdatedEvent(Object source, Long commentId, Comment comment) {
        super(source, "COMMENT_UPDATED");
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


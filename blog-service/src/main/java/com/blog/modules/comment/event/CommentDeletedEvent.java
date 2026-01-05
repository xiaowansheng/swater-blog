package com.blog.modules.comment.event;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.comment.model.entity.Comment;
public class CommentDeletedEvent extends BaseEvent {
    private final Long commentId;
    private final Comment comment;

    public CommentDeletedEvent(Object source, Long commentId, Comment comment) {
        super(source, "COMMENT_DELETED");
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


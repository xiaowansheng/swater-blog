package com.blog.modules.comment.event;


import com.blog.common.model.event.BaseEvent;
import com.blog.modules.comment.model.entity.Comment;
public class CommentApprovedEvent extends BaseEvent {
    private final Long commentId;
    private final Comment comment;

    public CommentApprovedEvent(Object source, Long commentId, Comment comment) {
        super(source, "COMMENT_APPROVED");
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


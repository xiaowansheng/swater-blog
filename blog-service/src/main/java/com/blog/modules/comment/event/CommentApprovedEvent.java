package com.blog.modules.comment.event;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.comment.model.entity.Comment;
public class CommentApprovedEvent extends BaseEvent {
    private final Long commentId;
    private final Comment comment;
    /**
     * 审核通过前该评论是否已被计入内容统计。
     * 重复审核同一评论时前态可能已计数，统计监听器据此避免重复累加。
     */
    private final boolean previouslyCounted;

    public CommentApprovedEvent(Object source, Long commentId, Comment comment) {
        this(source, commentId, comment, false);
    }

    public CommentApprovedEvent(Object source, Long commentId, Comment comment, boolean previouslyCounted) {
        super(source, "COMMENT_APPROVED");
        this.commentId = commentId;
        this.comment = comment;
        this.previouslyCounted = previouslyCounted;
    }

    public Long getCommentId() {
        return commentId;
    }

    public Comment getComment() {
        return comment;
    }

    public boolean isPreviouslyCounted() {
        return previouslyCounted;
    }
}

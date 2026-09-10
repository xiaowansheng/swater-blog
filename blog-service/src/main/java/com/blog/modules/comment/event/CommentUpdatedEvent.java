package com.blog.modules.comment.event;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.comment.model.entity.Comment;
public class CommentUpdatedEvent extends BaseEvent {
    private final Long commentId;
    private final Comment comment;
    /**
     * 变更前该评论是否已被计入内容统计（APPROVED 且 VISIBLE）。
     * 统计监听器必须依据「前态 → 后态」的迁移计算 delta，
     * 仅凭最终状态无法区分重复累加与漏减。
     */
    private final boolean previouslyCounted;

    public CommentUpdatedEvent(Object source, Long commentId, Comment comment) {
        this(source, commentId, comment, false);
    }

    public CommentUpdatedEvent(Object source, Long commentId, Comment comment, boolean previouslyCounted) {
        super(source, "COMMENT_UPDATED");
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

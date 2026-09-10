package com.blog.modules.comment.service.impl;
import com.blog.modules.comment.event.CommentApprovedEvent;
import com.blog.modules.comment.event.CommentDeletedEvent;
import com.blog.modules.comment.event.CommentUpdatedEvent;
import com.blog.modules.comment.model.enums.CommentStatus;
import com.blog.modules.comment.model.enums.CommentVisibilityStatus;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.comment.mapper.CommentMapper;
import com.blog.modules.comment.model.entity.Comment;
import com.blog.modules.comment.service.CommentCommandService;
import com.blog.modules.file.service.FileService;
import com.blog.shared.util.EventUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class CommentCommandServiceImpl implements CommentCommandService {
    private static final String REFERENCE_TYPE_COMMENT = "COMMENT";

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approve(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        boolean previouslyCounted = isCounted(comment);
        comment.setStatus(CommentStatus.APPROVED.getCode());
        comment.setIsVisible(CommentVisibilityStatus.VISIBLE.getCode());
        commentMapper.updateById(comment);

        Comment approvedComment = commentMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() ->
                eventPublisher.publishEvent(new CommentApprovedEvent(this, id, approvedComment, previouslyCounted)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        boolean previouslyCounted = isCounted(comment);
        comment.setStatus(CommentStatus.REJECTED.getCode());
        comment.setIsVisible(CommentVisibilityStatus.HIDDEN.getCode());
        commentMapper.updateById(comment);

        Comment updatedComment = commentMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() ->
                eventPublisher.publishEvent(new CommentUpdatedEvent(this, id, updatedComment, previouslyCounted)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }

        // 清理文件引用关系
        fileService.removeReferences(REFERENCE_TYPE_COMMENT, id);

        commentMapper.deleteById(id);

        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new CommentDeletedEvent(this, id, comment)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setVisible(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        boolean previouslyCounted = isCounted(comment);
        comment.setIsVisible(CommentVisibilityStatus.VISIBLE.getCode());
        commentMapper.updateById(comment);

        Comment updatedComment = commentMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() ->
                eventPublisher.publishEvent(new CommentUpdatedEvent(this, id, updatedComment, previouslyCounted)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setHidden(Long id) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            throw new BusinessException("评论不存在");
        }
        boolean previouslyCounted = isCounted(comment);
        comment.setIsVisible(CommentVisibilityStatus.HIDDEN.getCode());
        commentMapper.updateById(comment);

        Comment updatedComment = commentMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() ->
                eventPublisher.publishEvent(new CommentUpdatedEvent(this, id, updatedComment, previouslyCounted)));
    }

    /**
     * 该评论当前是否已被计入内容统计（审核通过且可见）。
     * 必须在实体变更【前】取值，作为事件的 previouslyCounted 传给统计监听器。
     */
    private boolean isCounted(Comment comment) {
        return comment != null
                && CommentStatus.APPROVED.matches(comment.getStatus())
                && CommentVisibilityStatus.VISIBLE.matches(comment.getIsVisible());
    }
}


package com.blog.plugin.components.comment;


import com.blog.plugin.core.Plugin;
import com.blog.shared.PageResult;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.comment.model.vo.CommentVO;

/**
 * 评论系统提供者插件接口
 */
public interface CommentProviderPlugin extends Plugin {
    CommentVO createComment(CommentDTO dto) throws Exception;

    PageResult<CommentVO> getComments(Long targetId, String targetType, Long page, Long size) throws Exception;

    CommentVO getCommentById(Long id) throws Exception;

    void deleteComment(Long id) throws Exception;

    void approveComment(Long id, boolean approved) throws Exception;
}


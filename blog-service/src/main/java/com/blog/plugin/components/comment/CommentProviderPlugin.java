package com.blog.plugin.components.comment;


import com.blog.shared.PageResult;
import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.modules.comment.model.vo.CommentVO;
/**
 * 评论系统提供者插件接口
 */
public interface CommentProviderPlugin {
    /**
     * 创建评论
     * @param dto 评论DTO
     * @return 评论VO
     */
    CommentVO createComment(CommentDTO dto) throws Exception;
    
    /**
     * 获取评论列表
     * @param targetId 目标ID
     * @param targetType 目标类型
     * @param page 页码
     * @param size 每页大小
     * @return 评论列表
     * @throws Exception 异常
     */
    PageResult<CommentVO> getComments(Long targetId, String targetType, Long page, Long size) throws Exception;
    
    /**
     * 根据ID获取评论
     * @param id 评论ID
     * @return 评论VO
     */
    CommentVO getCommentById(Long id) throws Exception;
    
    /**
     * 删除评论
     * @param id 评论ID
     */
    void deleteComment(Long id) throws Exception;
    
    /**
     * 审核评论
     * @param id 评论ID
     * @param approved 是否通过
     */
    void approveComment(Long id, boolean approved) throws Exception;
}


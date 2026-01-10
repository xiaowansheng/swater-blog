package com.blog.modules.comment.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.comment.model.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface CommentMapper extends com.blog.shared.model.BaseMapper<Comment> {

    /**
     * 统计评论的回复数量（仅统计可见且审核通过的）
     * @param commentId 评论ID
     * @return 回复数量
     */
    @Select("SELECT COUNT(*) FROM comment WHERE parent_id = #{commentId} AND status = 1 AND is_visible = 1")
    int countReplies(@Param("commentId") Long commentId);
}


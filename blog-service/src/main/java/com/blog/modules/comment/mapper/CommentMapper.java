package com.blog.modules.comment.mapper;



import com.blog.common.model.BaseMapper;
import com.blog.modules.comment.model.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
@Mapper
public interface CommentMapper extends com.blog.common.model.BaseMapper<Comment> {
}


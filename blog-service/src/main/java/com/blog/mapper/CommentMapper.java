package com.blog.mapper;

import com.blog.model.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends com.blog.mapper.BaseMapper<Comment> {
}


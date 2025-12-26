package com.blog.mapper;

import com.blog.model.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends com.blog.mapper.BaseMapper<User> {
}


package com.blog.mapper;

import com.blog.model.entity.UserRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserRoleMapper extends com.blog.mapper.BaseMapper<UserRole> {
    List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);

    void deleteByUserId(@Param("userId") Long userId);
}


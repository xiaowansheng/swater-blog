package com.blog.mapper;

import com.blog.model.entity.RoleApi;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface RoleApiMapper extends BaseMapper<RoleApi> {
    List<Long> selectApiIdsByRoleId(@Param("roleId") Long roleId);

    void deleteByRoleId(@Param("roleId") Long roleId);
}


package com.blog.modules.system.role.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.blog.modules.system.role.model.entity.RoleApi;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface RoleApiMapper extends BaseMapper<RoleApi> {
    List<Long> selectApiIdsByRoleId(@Param("roleId") Long roleId);

    @Delete("DELETE FROM role_api WHERE role_id = #{roleId}")
    void deleteByRoleId(@Param("roleId") Long roleId);
}


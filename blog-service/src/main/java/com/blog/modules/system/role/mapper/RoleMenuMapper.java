package com.blog.modules.system.role.mapper;




import com.blog.common.model.BaseMapper;
import com.blog.modules.system.role.model.entity.RoleMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface RoleMenuMapper extends com.blog.common.model.BaseMapper<RoleMenu> {
    void deleteByRoleId(@Param("roleId") Long roleId);

    void deleteByMenuId(@Param("menuId") Long menuId);

    List<Long> selectMenuIdsByRoleId(@Param("roleId") Long roleId);

    List<Long> selectMenuIdsByRoleIds(@Param("roleIds") List<Long> roleIds);
}


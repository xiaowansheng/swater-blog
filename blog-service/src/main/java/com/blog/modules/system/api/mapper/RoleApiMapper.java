package com.blog.modules.system.api.mapper;



import com.blog.modules.system.api.mapper.RoleApiMapper;
import com.blog.common.model.BaseMapper;
import com.blog.modules.system.api.model.entity.RoleApi;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
@Mapper
@Repository
public interface RoleApiMapper extends BaseMapper<RoleApi> {
}
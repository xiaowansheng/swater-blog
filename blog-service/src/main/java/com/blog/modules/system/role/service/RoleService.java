package com.blog.modules.system.role.service;


import com.blog.modules.system.role.model.dto.RoleDTO;
import com.blog.modules.system.role.model.vo.RoleVO;
import java.util.List;
public interface RoleService {
    List<RoleVO> list();

    RoleVO getById(Long id);

    List<RoleVO> getByIds(List<Long> ids);

    RoleVO getByName(String roleName);

    Long create(RoleDTO dto);

    void update(Long id, RoleDTO dto);

    void delete(Long id);

    void assignApis(Long id, List<Long> apiIds);
}


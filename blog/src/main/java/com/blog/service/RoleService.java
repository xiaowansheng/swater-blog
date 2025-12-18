package com.blog.service;

import com.blog.model.dto.RoleDTO;
import com.blog.model.vo.RoleVO;
import java.util.List;

public interface RoleService {
    List<RoleVO> list();

    RoleVO getById(Long id);

    List<RoleVO> getByIds(List<Long> ids);

    Long create(RoleDTO dto);

    void update(Long id, RoleDTO dto);

    void delete(Long id);

    void assignApis(Long id, List<Long> apiIds);
}


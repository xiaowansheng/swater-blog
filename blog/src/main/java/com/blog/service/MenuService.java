package com.blog.service;

import com.blog.model.dto.MenuDTO;
import com.blog.model.vo.MenuVO;

import java.util.List;

public interface MenuService {
    List<MenuVO> list();

    MenuVO getById(Long id);

    Long create(MenuDTO dto);

    void update(Long id, MenuDTO dto);

    void delete(Long id);

    void assignMenus(Long roleId, List<Long> menuIds);
}


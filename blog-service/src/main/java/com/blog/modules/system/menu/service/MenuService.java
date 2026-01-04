package com.blog.modules.system.menu.service;



import com.blog.modules.system.menu.model.dto.MenuDTO;
import com.blog.modules.system.menu.model.vo.MenuVO;
import java.util.List;
public interface MenuService {
    List<MenuVO> list();

    MenuVO getById(Long id);

    Long create(MenuDTO dto);

    void update(Long id, MenuDTO dto);

    void delete(Long id);

    void assignMenus(Long roleId, List<Long> menuIds);
}


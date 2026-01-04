package com.blog.modules.system.menu.service;



import com.blog.modules.system.menu.model.vo.MenuVO;
import java.util.List;
public interface MenuPublicService {
    List<MenuVO> getCurrentUserMenus();
}


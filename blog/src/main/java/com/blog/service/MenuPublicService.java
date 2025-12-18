package com.blog.service;

import com.blog.model.vo.MenuVO;

import java.util.List;

public interface MenuPublicService {
    List<MenuVO> getCurrentUserMenus();
}


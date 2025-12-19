package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.RoleMenuMapper;
import com.blog.mapper.SysMenuMapper;
import com.blog.mapper.UserRoleMapper;
import com.blog.model.entity.SysMenu;
import com.blog.model.vo.MenuVO;
import com.blog.service.MenuPublicService;
import com.blog.util.BeanUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MenuPublicServiceImpl implements MenuPublicService {
    @Autowired
    private SysMenuMapper sysMenuMapper;

    @Autowired
    private RoleMenuMapper roleMenuMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Override
    public List<MenuVO> getCurrentUserMenus() {
        if (!StpUtil.isLogin()) {
            return List.of();
        }

        Long userId = StpUtil.getLoginIdAsLong();
        List<Long> roleIds = userRoleMapper.selectRoleIdsByUserId(userId);

        if (roleIds == null || roleIds.isEmpty()) {
            return List.of();
        }

        List<Long> menuIds = roleMenuMapper.selectMenuIdsByRoleIds(roleIds);
        if (menuIds == null || menuIds.isEmpty()) {
            return List.of();
        }

        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(SysMenu::getId, menuIds)
                .eq(SysMenu::getDeleted, 0)
                .orderByAsc(SysMenu::getSort)
                .orderByDesc(SysMenu::getCreateTime);

        List<SysMenu> menus = sysMenuMapper.selectList(wrapper);
        List<MenuVO> voList = menus.stream()
                .map(menu -> BeanUtil.copyProperties(menu, MenuVO.class))
                .collect(Collectors.toList());

        return buildTree(voList);
    }

    private List<MenuVO> buildTree(List<MenuVO> menuList) {
        Map<Long, MenuVO> menuMap = menuList.stream()
                .collect(Collectors.toMap(MenuVO::getId, menu -> menu));

        List<MenuVO> rootMenus = new ArrayList<>();
        for (MenuVO menu : menuList) {
            if (menu.getParentId() == null || menu.getParentId() == 0) {
                rootMenus.add(menu);
            } else {
                MenuVO parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(menu);
                }
            }
        }
        return rootMenus;
    }
}


package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.exception.BusinessException;
import com.blog.mapper.RoleMenuMapper;
import com.blog.mapper.SysMenuMapper;
import com.blog.model.dto.MenuDTO;
import com.blog.model.entity.RoleMenu;
import com.blog.model.entity.SysMenu;
import com.blog.model.vo.MenuVO;
import com.blog.service.MenuService;
import com.blog.util.BeanUtil;
import com.blog.util.KeyUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MenuServiceImpl implements MenuService {
    @Autowired
    private SysMenuMapper sysMenuMapper;

    @Autowired
    private RoleMenuMapper roleMenuMapper;

    @Override
    public List<MenuVO> list() {
        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMenu::getDeleted, 0)
                .orderByAsc(SysMenu::getSort)
                .orderByDesc(SysMenu::getCreateTime);

        List<SysMenu> menus = sysMenuMapper.selectList(wrapper);
        List<MenuVO> voList = menus.stream()
                .map(menu -> BeanUtil.copyProperties(menu, MenuVO.class))
                .collect(Collectors.toList());

        return buildTree(voList);
    }

    @Override
    public MenuVO getById(Long id) {
        SysMenu menu = sysMenuMapper.selectById(id);
        if (menu == null || menu.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(menu, MenuVO.class);
    }

    @Override
    @Transactional
    public Long create(MenuDTO dto) {
        if (dto.getMenuKey() == null || dto.getMenuKey().isEmpty()) {
            dto.setMenuKey(KeyUtil.generateKey("menu"));
        } else {
            LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysMenu::getMenuKey, dto.getMenuKey()).eq(SysMenu::getDeleted, 0);
            if (sysMenuMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("菜单标识已存在");
            }
        }

        SysMenu menu = BeanUtil.copyProperties(dto, SysMenu.class);
        if (menu.getHidden() == null) {
            menu.setHidden(0);
        }
        if (menu.getSort() == null) {
            menu.setSort(0);
        }
        if (menu.getParentId() == null) {
            menu.setParentId(0L);
        }

        sysMenuMapper.insert(menu);

        if (dto.getRoleIds() != null && !dto.getRoleIds().isEmpty()) {
            for (Long roleId : dto.getRoleIds()) {
                RoleMenu roleMenu = new RoleMenu();
                roleMenu.setRoleId(roleId);
                roleMenu.setMenuId(menu.getId());
                roleMenu.setCreateTime(LocalDateTime.now());
                roleMenuMapper.insert(roleMenu);
            }
        }

        return menu.getId();
    }

    @Override
    @Transactional
    public void update(Long id, MenuDTO dto) {
        SysMenu menu = sysMenuMapper.selectById(id);
        if (menu == null || menu.getDeleted() == 1) {
            throw new BusinessException("菜单不存在");
        }

        if (dto.getMenuKey() != null && !dto.getMenuKey().equals(menu.getMenuKey())) {
            LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysMenu::getMenuKey, dto.getMenuKey()).eq(SysMenu::getDeleted, 0).ne(SysMenu::getId, id);
            if (sysMenuMapper.selectCount(wrapper) > 0) {
                throw new BusinessException("菜单标识已存在");
            }
        }

        BeanUtils.copyProperties(dto, menu);
        sysMenuMapper.updateById(menu);

        if (dto.getRoleIds() != null) {
            roleMenuMapper.deleteByMenuId(id);
            if (!dto.getRoleIds().isEmpty()) {
                for (Long roleId : dto.getRoleIds()) {
                    RoleMenu roleMenu = new RoleMenu();
                    roleMenu.setRoleId(roleId);
                    roleMenu.setMenuId(id);
                    roleMenu.setCreateTime(LocalDateTime.now());
                    roleMenuMapper.insert(roleMenu);
                }
            }
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        SysMenu menu = sysMenuMapper.selectById(id);
        if (menu == null || menu.getDeleted() == 1) {
            throw new BusinessException("菜单不存在");
        }

        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMenu::getParentId, id).eq(SysMenu::getDeleted, 0);
        if (sysMenuMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子菜单，无法删除");
        }

        roleMenuMapper.deleteByMenuId(id);
        sysMenuMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void assignMenus(Long roleId, List<Long> menuIds) {
        roleMenuMapper.deleteByRoleId(roleId);
        if (menuIds != null && !menuIds.isEmpty()) {
            saveRoleMenus(roleId, menuIds);
        }
    }

    private void saveRoleMenus(Long roleId, List<Long> menuIds) {
        for (Long menuId : menuIds) {
            RoleMenu roleMenu = new RoleMenu();
            roleMenu.setRoleId(roleId);
            roleMenu.setMenuId(menuId);
            roleMenu.setCreateTime(LocalDateTime.now());
            roleMenuMapper.insert(roleMenu);
        }
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


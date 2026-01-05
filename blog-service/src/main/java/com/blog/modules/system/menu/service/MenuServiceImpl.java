package com.blog.modules.system.menu.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.common.exception.BusinessException;
import com.blog.modules.system.role.mapper.RoleMenuMapper;
import com.blog.modules.system.menu.mapper.SysMenuMapper;
import com.blog.modules.system.menu.model.dto.MenuDTO;
import com.blog.modules.system.role.model.entity.RoleMenu;
import com.blog.modules.system.menu.model.entity.SysMenu;
import com.blog.modules.system.menu.model.vo.MenuVO;
import com.blog.modules.system.menu.service.MenuService;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.KeyUtil;
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
        wrapper.orderByAsc(SysMenu::getSort)
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
        if (menu == null) {
            return null;
        }
        return BeanUtil.copyProperties(menu, MenuVO.class);
    }

    @Override
    @Transactional
    public Long create(MenuDTO dto) {
        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMenu::getPath, dto.getPath());
        if (sysMenuMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("菜单标识已存在");
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
        if (menu == null) {
            throw new BusinessException("菜单不存在");
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
        if (menu == null) {
            throw new BusinessException("菜单不存在");
        }

        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMenu::getParentId, id);
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


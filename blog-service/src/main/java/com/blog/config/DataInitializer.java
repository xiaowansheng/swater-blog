package com.blog.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.RoleMapper;
import com.blog.mapper.UserMapper;
import com.blog.mapper.UserRoleMapper;
import com.blog.model.entity.Role;
import com.blog.model.entity.User;
import com.blog.model.entity.UserRole;
import com.blog.util.PasswordUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RoleMapper roleMapper;
    
    @Autowired
    private UserRoleMapper userRoleMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initAdminRole();
        initAdminUser();
    }

    private void initAdminRole() {
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getCode, "admin").eq(Role::getDeleted, 0);
        if (roleMapper.selectCount(wrapper) == 0) {
            Role adminRole = new Role();
            adminRole.setName("管理员");
            adminRole.setCode("admin");
            adminRole.setRoleKey("admin");
            adminRole.setDescription("系统管理员");
            adminRole.setStatus(1);
            adminRole.setDisabled(0);
            roleMapper.insert(adminRole);
            log.info("初始化管理员角色成功，角色ID: {}", adminRole.getId());
        } else {
            log.debug("管理员角色已存在，跳过初始化");
        }
    }

    private void initAdminUser() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, "admin").eq(User::getDeleted, 0);
        if (userMapper.selectCount(wrapper) == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(PasswordUtil.encode("admin123"));
            admin.setNickname("管理员");
            admin.setEmail("admin@example.com");
            admin.setRole("admin");
            admin.setStatus(1);
            admin.setDisabled(0);
            userMapper.insert(admin);
            log.info("初始化管理员账号成功，用户名: admin，密码: admin123，用户ID: {}", admin.getId());

            LambdaQueryWrapper<Role> roleWrapper = new LambdaQueryWrapper<>();
            roleWrapper.eq(Role::getCode, "admin").eq(Role::getDeleted, 0);
            Role adminRole = roleMapper.selectOne(roleWrapper);
            if (adminRole != null) {
                UserRole userRole = new UserRole();
                userRole.setUserId(admin.getId());
                userRole.setRoleId(adminRole.getId());
                userRole.setCreateTime(LocalDateTime.now());
                userRoleMapper.insert(userRole);
                log.info("为管理员账号分配角色成功，角色ID: {}", adminRole.getId());
            }
        } else {
            log.debug("管理员账号已存在，跳过初始化");
        }
    }
}


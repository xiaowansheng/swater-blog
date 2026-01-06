package com.blog.bootstrap.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.system.role.mapper.RoleMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.system.role.model.entity.Role;
import com.blog.modules.user.model.entity.User;
import com.blog.shared.util.PasswordUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Slf4j
@Component
public class DataInitializer implements ApplicationRunner {
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RoleMapper roleMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initAdminRole();
        initAdminUser();
    }

    private void initAdminRole() {
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Role::getRoleKey, "admin").eq(Role::getDeleted, 0);
        if (roleMapper.selectCount(wrapper) == 0) {
            Role adminRole = new Role();
            adminRole.setName("管理员");
            adminRole.setRoleKey("admin");
            adminRole.setDescription("系统管理员");
            roleMapper.insert(adminRole);
            log.info("初始化管理员角色成功，角色ID: {}", adminRole.getId());
        } else {
            log.debug("管理员角色已存在，跳过初始化");
        }
    }

    private void initAdminUser() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, "admin").eq(User::getDeleted, 0);
        User admin = userMapper.selectOne(wrapper);
        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setPassword(PasswordUtil.encode("123456"));
            admin.setNickname("管理员");
            admin.setEmail("admin@blog.com");
            admin.setIpAddressSignup("127.0.0.1");
            admin.setIpSourceSignup("本地");
            admin.setRoleKey("admin");
            admin.setStatus(1);
            admin.setDisabled(0);
            userMapper.insert(admin);
            log.info("初始化管理员账号成功，用户名: admin，密码: 123456，用户ID: {}", admin.getId());
        } else {
            // // 确保管理员账号是启用状态且密码正确（可选，这里仅确保状态）
            // boolean updated = false;
            // if (admin.getStatus() == null || admin.getStatus() == 0) {
            //     admin.setStatus(1);
            //     updated = true;
            // }
            // if (admin.getDisabled() == null || admin.getDisabled() == 1) {
            //     admin.setDisabled(0);
            //     updated = true;
            // }
            // // 强制重置管理员密码为 123456 以解决登录问题
            //  admin.setPassword(PasswordUtil.encode("123456"));
            //  updated = true;
             
            //  if (updated) {
            //     userMapper.updateById(admin);
            //     log.info("更新管理员账号状态成功");
            // }
            log.debug("管理员账号已存在，跳过初始化");
        }
    }
}


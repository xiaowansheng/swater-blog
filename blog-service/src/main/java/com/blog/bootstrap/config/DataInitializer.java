package com.blog.bootstrap.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.infrastructure.mail.EmailService;
import com.blog.modules.system.role.mapper.RoleMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.system.role.model.entity.Role;
import com.blog.modules.user.model.entity.User;
import com.blog.shared.model.enums.DisabledFlag;
import com.blog.shared.model.enums.EnableStatus;
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
    private static final String DEV_ADMIN_PASSWORD = "ChangeMe_Dev_Only_2025!";

    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RoleMapper roleMapper;

    @Autowired
    private EmailService emailService;

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
            admin.setPassword(PasswordUtil.encode(DEV_ADMIN_PASSWORD));
            admin.setNickname("管理员");
            admin.setEmail(emailService.getFrom());
            admin.setIpAddressSignup("127.0.0.1");
            admin.setIpSourceSignup("本地");
            admin.setRoleKey("admin");
            admin.setStatus(EnableStatus.ENABLED.getCode());
            admin.setDisabled(DisabledFlag.NO.getCode());
            userMapper.insert(admin);
            log.info("初始化管理员账号成功，用户名: admin，开发默认密码: {}，用户ID: {}", DEV_ADMIN_PASSWORD, admin.getId());
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
            // // 强制重置管理员密码为开发默认密码以解决登录问题
            //  admin.setPassword(PasswordUtil.encode(DEV_ADMIN_PASSWORD));
            //  updated = true;
             
            //  if (updated) {
            //     userMapper.updateById(admin);
            //     log.info("更新管理员账号状态成功");
            // }
            log.debug("管理员账号已存在，跳过初始化");
        }
    }
}


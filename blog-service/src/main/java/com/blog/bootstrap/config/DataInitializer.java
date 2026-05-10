package com.blog.bootstrap.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.system.role.mapper.RoleMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.system.role.model.entity.Role;
import com.blog.modules.user.model.entity.User;
import com.blog.shared.model.enums.DisabledFlag;
import com.blog.shared.model.enums.EnableStatus;
import com.blog.shared.util.PasswordUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Component
public class DataInitializer implements ApplicationRunner {
    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final String adminUsername;
    private final String adminPassword;
    private final String adminEmail;

    public DataInitializer(
            UserMapper userMapper,
            RoleMapper roleMapper,
            @Value("${blog.bootstrap.admin.username:admin}") String adminUsername,
            @Value("${blog.bootstrap.admin.password:}") String adminPassword,
            @Value("${blog.bootstrap.admin.email:admin@example.com}") String adminEmail
    ) {
        this.userMapper = userMapper;
        this.roleMapper = roleMapper;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.adminEmail = adminEmail;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminExists()) {
            initAdminRole();
            log.debug("开发管理员账号已存在，跳过初始化");
            return;
        }

        validateBootstrapConfig();
        initAdminRole();
        initAdminUser();
    }

    private boolean adminExists() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, adminUsername).eq(User::getDeleted, 0);
        return userMapper.selectOne(wrapper) != null;
    }

    private void validateBootstrapConfig() {
        if (!StringUtils.hasText(adminPassword)) {
            throw new IllegalStateException("缺少管理员初始密码，请设置 BLOG_BOOTSTRAP_ADMIN_PASSWORD");
        }
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
        wrapper.eq(User::getUsername, adminUsername).eq(User::getDeleted, 0);
        User admin = userMapper.selectOne(wrapper);
        if (admin == null) {
            admin = new User();
            admin.setUsername(adminUsername);
            admin.setPassword(PasswordUtil.encode(adminPassword));
            admin.setNickname("管理员");
            admin.setEmail(adminEmail);
            admin.setIpAddressSignup("127.0.0.1");
            admin.setIpSourceSignup("本地");
            admin.setRoleKey("admin");
            admin.setStatus(EnableStatus.ENABLED.getCode());
            admin.setDisabled(DisabledFlag.NO.getCode());
            userMapper.insert(admin);
            log.info("初始化管理员账号成功，用户名: {}，用户ID: {}", adminUsername, admin.getId());
        }
    }
}


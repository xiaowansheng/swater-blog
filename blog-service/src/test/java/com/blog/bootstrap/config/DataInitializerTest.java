package com.blog.bootstrap.config;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.blog.modules.system.role.mapper.RoleMapper;
import com.blog.modules.system.role.model.entity.Role;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.user.model.entity.User;
import com.blog.shared.util.PasswordUtil;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationArguments;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DataInitializerTest {

    @Test
    void run_throwsWhenAdminPasswordMissing() {
        UserMapper userMapper = mock(UserMapper.class);
        RoleMapper roleMapper = mock(RoleMapper.class);
        DataInitializer initializer = new DataInitializer(
                userMapper,
                roleMapper,
                "admin",
                "",
                "admin@example.com"
        );

        assertThatIllegalStateException()
                .isThrownBy(() -> initializer.run(mock(ApplicationArguments.class)))
                .withMessageContaining("BLOG_BOOTSTRAP_ADMIN_PASSWORD");

        verify(roleMapper, never()).insert(any(Role.class));
        verify(userMapper, never()).insert(any(User.class));
    }

    @Test
    void run_createsConfiguredAdminWithHashedPassword() throws Exception {
        UserMapper userMapper = mock(UserMapper.class);
        RoleMapper roleMapper = mock(RoleMapper.class);
        when(roleMapper.selectCount(any(Wrapper.class))).thenReturn(1L);
        when(userMapper.selectOne(any(Wrapper.class))).thenReturn(null);

        DataInitializer initializer = new DataInitializer(
                userMapper,
                roleMapper,
                "dev-admin",
                "S3cure-For-Test",
                "dev-admin@example.com"
        );

        initializer.run(mock(ApplicationArguments.class));

        org.mockito.ArgumentCaptor<User> userCaptor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(userMapper).insert(userCaptor.capture());

        User inserted = userCaptor.getValue();
        assertThat(inserted.getUsername()).isEqualTo("dev-admin");
        assertThat(inserted.getEmail()).isEqualTo("dev-admin@example.com");
        assertThat(inserted.getRoleKey()).isEqualTo("admin");
        assertThat(inserted.getPassword()).isNotEqualTo("S3cure-For-Test");
        assertThat(PasswordUtil.matches("S3cure-For-Test", inserted.getPassword())).isTrue();
    }
}

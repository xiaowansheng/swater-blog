package com.blog.modules.auth.service;



import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.bootstrap.context.UserContext;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.auth.model.dto.LoginDTO;
import com.blog.modules.auth.model.dto.EmailVerifyDTO;
import com.blog.modules.auth.model.dto.SendCodeDTO;
import com.blog.modules.auth.model.dto.ResetPasswordDTO;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.auth.model.vo.LoginVO;
import com.blog.modules.auth.model.vo.EmailVerifyVO;
import com.blog.modules.system.role.model.vo.RoleVO;
import com.blog.modules.user.model.vo.UserVO;
import com.blog.modules.user.event.user.UserLoggedInEvent;
import com.blog.modules.user.event.user.UserLoggedOutEvent;
import com.blog.modules.auth.service.AuthService;
import com.blog.modules.auth.config.EmailSessionProperties;
import com.blog.modules.auth.util.EmailSessionTokenUtil;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PasswordUtil;
import com.blog.shared.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private com.blog.modules.system.role.service.RoleService roleService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private MessageVerificationService messageVerificationService;

    @Autowired
    private EmailSessionProperties emailSessionProperties;

    @Autowired
    private AuthCryptoService authCryptoService;

    @Override
    public LoginVO login(LoginDTO dto) {
        log.info("用户尝试登录: {}", dto.getUsername());

        String rawPassword = dto.getPassword();
        if (dto.getEncryptedPassword() != null && !dto.getEncryptedPassword().isBlank()) {
            rawPassword = authCryptoService.decryptPassword(dto.getEncryptedPassword(), dto.getNonce());
        }

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new BusinessException("用户名或密码错误");
        }
        
        // 支持用户名或邮箱登录
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .and(w -> w.eq(User::getUsername, dto.getUsername())
                        .or().eq(User::getEmail, dto.getUsername())));
        
        if (user == null) {
            log.warn("登录失败: 用户 {} 不存在", dto.getUsername());
            throw new BusinessException("用户名或密码错误");
        }
        
        if (user.getStatus() != null && user.getStatus() == 0) {
            log.warn("登录失败: 用户 {} 已被禁用", dto.getUsername());
            throw new BusinessException("用户已被禁用");
        }
        
        if (user.getDisabled() != null && user.getDisabled() == 1) {
            log.warn("登录失败: 用户 {} 已被禁用", dto.getUsername());
            throw new BusinessException("用户已被禁用");
        }
        
        if (!PasswordUtil.matches(rawPassword, user.getPassword())) {
            log.warn("登录失败: 用户 {} 密码不匹配", dto.getUsername());
            throw new BusinessException("用户名或密码错误");
        }
        
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();
        
        user.setLastLoginTime(LocalDateTime.now());
        userMapper.updateById(user);
        

        
        UserVO userVO = convertToVO(user);
        
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUser(userVO);
        
        String ip = RequestUtil.getClientIp();
        eventPublisher.publishEvent(new UserLoggedInEvent(this, user.getId(), ip != null ? ip : ""));
        
        return loginVO;
    }

    @Override
    public LoginVO loginWithEmail(String email, String code) {
        log.info("用户尝试使用邮箱验证码登录: {}", email);

        // 验证邮箱验证码
        messageVerificationService.validateEmailCode(email, code);

        // 查找用户
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getEmail, email));

        if (user == null) {
            log.warn("邮箱登录失败: 邮箱 {} 对应的用户不存在", email);
            throw new BusinessException("该邮箱未注册");
        }

        if (user.getStatus() != null && user.getStatus() == 0) {
            log.warn("登录失败: 用户 {} 已被禁用", email);
            throw new BusinessException("用户已被禁用");
        }

        if (user.getDisabled() != null && user.getDisabled() == 1) {
            log.warn("登录失败: 用户 {} 已被禁用", email);
            throw new BusinessException("用户已被禁用");
        }

        // 登录成功
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();

        user.setLastLoginTime(LocalDateTime.now());
        userMapper.updateById(user);

        UserVO userVO = convertToVO(user);

        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setUser(userVO);

        String ip = RequestUtil.getClientIp();
        eventPublisher.publishEvent(new UserLoggedInEvent(this, user.getId(), ip != null ? ip : ""));

        return loginVO;
    }

    @Override
    public void sendCode(SendCodeDTO dto) {
        log.info("发送邮箱验证码: email={}, type={}", dto.getEmail(), dto.getType());

        // 如果是登录类型，需要检查邮箱是否已注册
        if ("login".equals(dto.getType())) {
            User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getEmail, dto.getEmail()));
            if (user == null) {
                throw new BusinessException("该邮箱未注册");
            }
        }

        // 如果是重置密码类型，也需要检查邮箱是否已注册
        if ("reset".equals(dto.getType())) {
            User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getEmail, dto.getEmail()));
            if (user == null) {
                throw new BusinessException("该邮箱未注册");
            }
        }

        messageVerificationService.sendEmailCode(dto.getEmail());
    }

    @Override
    public void resetPassword(ResetPasswordDTO dto) {
        log.info("重置密码: email={}", dto.getEmail());

        // 验证邮箱验证码
        messageVerificationService.validateEmailCode(dto.getEmail(), dto.getCode());

        // 查找用户
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getEmail, dto.getEmail()));

        if (user == null) {
            log.warn("重置密码失败: 邮箱 {} 对应的用户不存在", dto.getEmail());
            throw new BusinessException("该邮箱未注册");
        }

        // 更新密码
        user.setPassword(PasswordUtil.encode(dto.getNewPassword()));
        userMapper.updateById(user);

        log.info("密码重置成功: email={}", dto.getEmail());
    }

    @Override
    public EmailVerifyVO verifyEmail(EmailVerifyDTO dto) {
        messageVerificationService.validateEmailCode(dto.getEmail(), dto.getCode());
        String token = EmailSessionTokenUtil.createToken(dto.getEmail(), emailSessionProperties);

        EmailVerifyVO vo = new EmailVerifyVO();
        vo.setToken(token);
        vo.setEmail(dto.getEmail());
        vo.setExpiresIn(emailSessionProperties.getTtlSeconds());
        return vo;
    }

    @Override
    public void logout() {
        Long userId = null;
        if (StpUtil.isLogin()) {
            userId = StpUtil.getLoginIdAsLong();
        }
        StpUtil.logout();
        if (userId != null) {
            eventPublisher.publishEvent(new UserLoggedOutEvent(this, userId));
        }
    }

    @Override
    public UserVO getCurrentUser() {
        // 从 UserContext 获取当前用户，避免重复查询数据库
        return UserContext.getCurrentUser();
    }

    @Override
    public String refreshToken() {
        if (!StpUtil.isLogin()) {
            throw new BusinessException("未登录");
        }
        StpUtil.renewTimeout(2592000);
        return StpUtil.getTokenValue();
    }

    private UserVO convertToVO(User user) {
        UserVO vo = BeanUtil.copyProperties(user, UserVO.class);
        if (user.getRoleKey() != null && !user.getRoleKey().isEmpty()) {
            // 根据用户的roleKey字段获取角色信息
            RoleVO role = roleService.getByName(user.getRoleKey());
            if (role != null) {
                vo.setRoles(List.of(role));
            }
        }
        return vo;
    }

}


package com.blog.modules.auth.service;


import com.blog.modules.auth.model.dto.LoginDTO;
import com.blog.modules.auth.model.vo.LoginVO;
import com.blog.modules.user.model.vo.UserVO;
public interface AuthService {
    LoginVO login(LoginDTO dto);

    void logout();

    UserVO getCurrentUser();

    String refreshToken();
}


package com.blog.service;

import com.blog.model.dto.LoginDTO;
import com.blog.model.vo.LoginVO;
import com.blog.model.vo.UserVO;

public interface AuthService {
    LoginVO login(LoginDTO dto);

    void logout();

    UserVO getCurrentUser();

    String refreshToken();
}


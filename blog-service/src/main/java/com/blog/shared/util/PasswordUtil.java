package com.blog.shared.util;


import cn.hutool.crypto.digest.BCrypt;

public class PasswordUtil {
    public static String encode(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("密码不能为空");
        }
        if (encodedPassword == null || encodedPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("编码密码不能为空");
        }
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }
}


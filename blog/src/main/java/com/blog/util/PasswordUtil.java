package com.blog.util;

import cn.hutool.crypto.digest.BCrypt;

public class PasswordUtil {
    public static String encode(String password) {
        return BCrypt.hashpw(password);
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }
}


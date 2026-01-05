package com.blog.shared.util;


import cn.hutool.crypto.digest.BCrypt;
public class PasswordUtil {
    public static String encode(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        if (encodedPassword == null || encodedPassword.isEmpty()) {
            return false;
        }
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }
}


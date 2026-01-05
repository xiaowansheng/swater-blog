package com.blog.common.util;


import java.util.UUID;
public class KeyUtil {
    public static String generateKey(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}


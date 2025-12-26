package com.blog.security;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * 数据脱敏服务
 * 用于敏感数据的脱敏处理
 */
@Service
public class DataMaskingService {
    
    // 邮箱正则
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$");
    
    // 手机号正则
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");
    
    // 身份证号正则
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("^\\d{17}[\\dXx]$");
    
    /**
     * 脱敏邮箱地址
     * example@domain.com -> e***@domain.com
     */
    public String maskEmail(String email) {
        if (!StringUtils.hasText(email) || !EMAIL_PATTERN.matcher(email).matches()) {
            return email;
        }
        
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return email;
        }
        
        String username = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        
        if (username.length() <= 2) {
            return username.charAt(0) + "*" + domain;
        } else {
            return username.charAt(0) + "***" + username.charAt(username.length() - 1) + domain;
        }
    }
    
    /**
     * 脱敏手机号
     * 13812345678 -> 138****5678
     */
    public String maskPhone(String phone) {
        if (!StringUtils.hasText(phone) || !PHONE_PATTERN.matcher(phone).matches()) {
            return phone;
        }
        
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }
    
    /**
     * 脱敏身份证号
     * 123456789012345678 -> 1234**********5678
     */
    public String maskIdCard(String idCard) {
        if (!StringUtils.hasText(idCard) || !ID_CARD_PATTERN.matcher(idCard).matches()) {
            return idCard;
        }
        
        return idCard.substring(0, 4) + "**********" + idCard.substring(14);
    }
    
    /**
     * 脱敏姓名
     * 张三 -> 张*
     * 张三丰 -> 张*丰
     * 欧阳修 -> 欧*修
     */
    public String maskName(String name) {
        if (!StringUtils.hasText(name)) {
            return name;
        }
        
        int length = name.length();
        if (length <= 1) {
            return name;
        } else if (length == 2) {
            return name.charAt(0) + "*";
        } else {
            StringBuilder masked = new StringBuilder();
            masked.append(name.charAt(0));
            for (int i = 1; i < length - 1; i++) {
                masked.append("*");
            }
            masked.append(name.charAt(length - 1));
            return masked.toString();
        }
    }
    
    /**
     * 脱敏银行卡号
     * 1234567890123456 -> 1234 **** **** 3456
     */
    public String maskBankCard(String bankCard) {
        if (!StringUtils.hasText(bankCard) || bankCard.length() < 8) {
            return bankCard;
        }
        
        String cleaned = bankCard.replaceAll("\\s", "");
        if (cleaned.length() < 8) {
            return bankCard;
        }
        
        StringBuilder masked = new StringBuilder();
        masked.append(cleaned.substring(0, 4));
        
        int middleLength = cleaned.length() - 8;
        for (int i = 0; i < middleLength; i++) {
            if (i % 4 == 0) {
                masked.append(" ");
            }
            masked.append("*");
        }
        
        masked.append(" ").append(cleaned.substring(cleaned.length() - 4));
        return masked.toString();
    }
    
    /**
     * 脱敏地址
     * 保留省市，脱敏详细地址
     */
    public String maskAddress(String address) {
        if (!StringUtils.hasText(address) || address.length() <= 6) {
            return address;
        }
        
        // 简单的地址脱敏：保留前6个字符，后面用*代替
        return address.substring(0, 6) + "****";
    }
    
    /**
     * 脱敏IP地址
     * 192.168.1.100 -> 192.168.***.100
     */
    public String maskIp(String ip) {
        if (!StringUtils.hasText(ip)) {
            return ip;
        }
        
        String[] parts = ip.split("\\.");
        if (parts.length == 4) {
            return parts[0] + "." + parts[1] + ".***." + parts[3];
        }
        
        return ip;
    }
    
    /**
     * 通用字符串脱敏
     * 保留前后各n个字符，中间用*代替
     */
    public String maskString(String str, int keepStart, int keepEnd) {
        if (!StringUtils.hasText(str)) {
            return str;
        }
        
        int length = str.length();
        if (length <= keepStart + keepEnd) {
            return str;
        }
        
        StringBuilder masked = new StringBuilder();
        masked.append(str.substring(0, keepStart));
        
        int maskLength = length - keepStart - keepEnd;
        for (int i = 0; i < maskLength; i++) {
            masked.append("*");
        }
        
        masked.append(str.substring(length - keepEnd));
        return masked.toString();
    }
    
    /**
     * 脱敏用户密码（用于日志）
     * 任何密码都返回 ******
     */
    public String maskPassword(String password) {
        return StringUtils.hasText(password) ? "******" : password;
    }
    
    /**
     * 脱敏QQ号
     * 123456789 -> 123***789
     */
    public String maskQQ(String qq) {
        if (!StringUtils.hasText(qq) || qq.length() < 5) {
            return qq;
        }
        
        return maskString(qq, 3, 3);
    }
    
    /**
     * 检查字符串是否包含敏感信息
     */
    public boolean containsSensitiveInfo(String text) {
        if (!StringUtils.hasText(text)) {
            return false;
        }
        
        // 检查是否包含邮箱
        if (EMAIL_PATTERN.matcher(text).find()) {
            return true;
        }
        
        // 检查是否包含手机号
        if (PHONE_PATTERN.matcher(text).find()) {
            return true;
        }
        
        // 检查是否包含身份证号
        if (ID_CARD_PATTERN.matcher(text).find()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 自动脱敏文本中的敏感信息
     */
    public String autoMaskSensitiveInfo(String text) {
        if (!StringUtils.hasText(text)) {
            return text;
        }
        
        String result = text;
        
        // 脱敏邮箱
        result = EMAIL_PATTERN.matcher(result).replaceAll(match -> maskEmail(match.group()));
        
        // 脱敏手机号
        result = PHONE_PATTERN.matcher(result).replaceAll(match -> maskPhone(match.group()));
        
        // 脱敏身份证号
        result = ID_CARD_PATTERN.matcher(result).replaceAll(match -> maskIdCard(match.group()));
        
        return result;
    }
}
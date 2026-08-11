package com.blog.shared.util;


import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Set;
import java.util.regex.Pattern;
/**
 * IP工具类
 */
public class IpUtil {
    
    private static final String UNKNOWN = "unknown";
    private static final String LOCALHOST_IPV4 = "127.0.0.1";
    private static final String LOCALHOST_IPV6 = "0:0:0:0:0:0:0:1";
    private static final Pattern IP_PATTERN = Pattern.compile(
        "^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$"
    );
    
    /**
     * 获取客户端真实IP地址
     */
    public static String getClientIp(HttpServletRequest request) {
        return getClientIp(request, Set.of());
    }

    /**
     * Gets the client IP and only accepts forwarding headers when the direct peer is trusted.
     */
    public static String getClientIp(HttpServletRequest request, Set<String> trustedProxies) {
        if (request == null) {
            return UNKNOWN;
        }

        String remoteIp = request.getRemoteAddr();
        if (trustedProxies != null && isTrustedProxy(remoteIp, trustedProxies)) {
            String realIp = request.getHeader("X-Real-IP");
            if (isValidIpAddress(realIp)) {
                return realIp.trim();
            }

            String forwardedIp = firstValidForwardedIp(request.getHeader("X-Forwarded-For"));
            if (forwardedIp != null) {
                return forwardedIp;
            }
        }

        String ip = remoteIp;

        // 如果是本地回环地址，尝试获取本机真实IP
        if (LOCALHOST_IPV4.equals(ip) || LOCALHOST_IPV6.equals(ip)) {
            try {
                InetAddress addr = InetAddress.getLocalHost();
                ip = addr.getHostAddress();
            } catch (UnknownHostException e) {
                // 忽略异常，使用原IP
            }
        }

        return ip;
    }

    private static String firstValidForwardedIp(String headerValue) {
        if (headerValue == null) {
            return null;
        }
        for (String candidate : headerValue.split(",")) {
            String normalized = candidate.trim();
            // 转发头可能携带 IPv6，用通用校验（isValidIp 仅认 IPv4）
            if (isValidIpAddress(normalized)) {
                return normalized;
            }
        }
        return null;
    }

    /**
     * IPv4/IPv6 通用地址合法性校验。
     * <p>
     * IPv4 走快速正则；IPv6 交由 {@link InetAddress} 解析。
     * 注意：IPv6 有多种等价文本形式（如 {@code 2001:db8::9} 与全展开），不能用字符串
     * 等值判定，故用「包含冒号且能被解析」作为 IPv6 判据。
     */
    private static boolean isValidIpAddress(String ip) {
        if (ip == null || ip.isEmpty() || UNKNOWN.equalsIgnoreCase(ip)) {
            return false;
        }
        if (IP_PATTERN.matcher(ip).matches()) {
            return true;
        }
        // 仅对看起来像 IPv6（含冒号）的串做严格解析，避免对主机名触发 DNS
        if (ip.indexOf(':') < 0) {
            return false;
        }
        try {
            InetAddress.getByName(ip);
            return true;
        } catch (UnknownHostException e) {
            return false;
        }
    }

    private static boolean isTrustedProxy(String remoteIp, Set<String> trustedProxies) {
        // 不复用 IPv4-only 的 isValidIp：IPv6 代理（如 ::1、fd00::/8）也须能匹配
        if (remoteIp == null || remoteIp.isEmpty()) {
            return false;
        }
        for (String proxy : trustedProxies) {
            if (proxy.equals(remoteIp)) {
                return true;
            }
            if (proxy.contains("/") && isIpInCidr(remoteIp, proxy)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断 IP 是否落在 CIDR 网段内，兼容 IPv4 与 IPv6。
     * 例：127.0.0.1 ∈ 127.0.0.0/8、::1 ∈ ::1/128、fd00::1 ∈ fd00::/8。
     */
    private static boolean isIpInCidr(String ip, String cidr) {
        String[] parts = cidr.split("/", 2);
        if (parts.length != 2) {
            return false;
        }
        try {
            int prefixLength = Integer.parseInt(parts[1]);
            byte[] ipBytes = InetAddress.getByName(ip).getAddress();
            // 前缀长度上限 = 该地址族位数（IPv4=32，IPv6=128）
            int maxPrefix = ipBytes.length * 8;
            if (prefixLength < 0 || prefixLength > maxPrefix) {
                return false;
            }
            byte[] cidrBytes = InetAddress.getByName(parts[0]).getAddress();
            // IPv4 与 IPv6 不可混比（InetAddress 会把 IPv4 映射成 4 字节）
            if (cidrBytes.length != ipBytes.length) {
                return false;
            }
            return matchesPrefix(ipBytes, cidrBytes, prefixLength);
        } catch (NumberFormatException | UnknownHostException e) {
            return false;
        }
    }

    /**
     * 逐位比较前 prefixLength 个 bit 是否相同。
     */
    private static boolean matchesPrefix(byte[] ip, byte[] cidr, int prefixLength) {
        int fullBytes = prefixLength / 8;
        for (int i = 0; i < fullBytes; i++) {
            if (ip[i] != cidr[i]) {
                return false;
            }
        }
        int leftoverBits = prefixLength % 8;
        if (leftoverBits == 0) {
            return true;
        }
        // 比较剩余的不足 8 位：用掩码清零低位再比
        int mask = 0xFF << (8 - leftoverBits);
        int idx = fullBytes;
        return (ip[idx] & mask) == (cidr[idx] & mask);
    }
    
    /**
     * 检查IP是否有效
     */
    private static boolean isValidIp(String ip) {
        return ip != null 
            && !ip.isEmpty() 
            && !UNKNOWN.equalsIgnoreCase(ip)
            && IP_PATTERN.matcher(ip).matches();
    }
    
    /**
     * 检查是否为内网IP
     */
    public static boolean isInternalIp(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        
        if (LOCALHOST_IPV4.equals(ip) || LOCALHOST_IPV6.equals(ip)) {
            return true;
        }
        
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return false;
        }
        
        try {
            int first = Integer.parseInt(parts[0]);
            int second = Integer.parseInt(parts[1]);
            
            // 10.0.0.0 - 10.255.255.255
            if (first == 10) {
                return true;
            }
            
            // 172.16.0.0 - 172.31.255.255
            if (first == 172 && second >= 16 && second <= 31) {
                return true;
            }
            
            // 192.168.0.0 - 192.168.255.255
            if (first == 192 && second == 168) {
                return true;
            }
            
        } catch (NumberFormatException e) {
            return false;
        }
        
        return false;
    }
    
    /**
     * IP地址转换为长整型
     */
    public static long ipToLong(String ip) {
        if (ip == null || ip.isEmpty()) {
            return 0;
        }
        
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return 0;
        }
        
        try {
            long result = 0;
            for (int i = 0; i < 4; i++) {
                int part = Integer.parseInt(parts[i]);
                if (part < 0 || part > 255) {
                    return 0;
                }
                result = (result << 8) + part;
            }
            return result;
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    /**
     * 长整型转换为IP地址
     */
    public static String longToIp(long ip) {
        return ((ip >> 24) & 0xFF) + "." +
               ((ip >> 16) & 0xFF) + "." +
               ((ip >> 8) & 0xFF) + "." +
               (ip & 0xFF);
    }
    
    /**
     * 掩码IP地址（用于日志脱敏）
     */
    public static String maskIp(String ip) {
        if (ip == null || ip.isEmpty()) {
            return ip;
        }
        
        String[] parts = ip.split("\\.");
        if (parts.length == 4) {
            return parts[0] + "." + parts[1] + ".***." + parts[3];
        }
        
        return ip;
    }
}

package com.blog.shared.util;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * URL 安全校验工具，主要用于防范 SSRF（服务端请求伪造）。
 *
 * <p>校验维度：
 * <ol>
 *   <li>scheme 白名单（默认仅 http/https）；</li>
 *   <li>主机名必须可解析；</li>
 *   <li>解析出的所有 IP 逐一比对，任一落在内网/环回/链路本地/站点本地/组播地址即拒绝，
 *       防止 DNS rebinding 到内网。</li>
 * </ol>
 *
 * <p>调用方在发起外网请求前应调用 {@link #isUrlAllowed(String)} 或
 * {@link #isUrlAllowed(String, Set)}，并禁用自动重定向或对重定向目标二次校验。
 */
public final class UrlSafetyUtil {

    /** 默认允许的 scheme：http、https。 */
    private static final Set<String> DEFAULT_ALLOWED_SCHEMES = Set.of("http", "https");

    private UrlSafetyUtil() {
    }

    /**
     * 使用默认 scheme 白名单（http/https）校验 URL 是否可安全访问。
     */
    public static boolean isUrlAllowed(String url) {
        return isUrlAllowed(url, DEFAULT_ALLOWED_SCHEMES);
    }

    /**
     * 校验 URL 是否可安全访问。
     *
     * @param url            待校验的 URL
     * @param allowedSchemes 允许的 scheme 集合（小写），如 {@code Set.of("https")}
     * @return true 表示目标地址不在内网/环回等敏感网段，可安全访问；false 表示应拒绝
     */
    public static boolean isUrlAllowed(String url, Set<String> allowedSchemes) {
        if (url == null || url.isBlank()) {
            return false;
        }
        URI uri;
        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException e) {
            return false;
        }
        String scheme = uri.getScheme();
        if (scheme == null) {
            return false;
        }
        Set<String> allowed = (allowedSchemes != null && !allowedSchemes.isEmpty())
                ? allowedSchemes
                : DEFAULT_ALLOWED_SCHEMES;
        if (!allowed.contains(scheme.toLowerCase())) {
            return false;
        }

        String host = uri.getHost();
        if (host == null || host.isEmpty()) {
            return false;
        }

        // 解析所有 IP 并逐一校验，任一落在内网段即拒绝（防 DNS rebinding）
        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(host);
        } catch (UnknownHostException e) {
            return false;
        }
        for (InetAddress addr : addresses) {
            if (isInternalAddress(addr)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断地址是否属于内网/环回/链路本地等不应被 SSRF 访问的敏感网段。
     *
     * <ul>
     *   <li>{@code isAnyLocalAddress}：0.0.0.0 / ::</li>
     *   <li>{@code isLoopbackAddress}：127.0.0.0/8、::1</li>
     *   <li>{@code isLinkLocalAddress}：169.254.0.0/16、fe80::/10（含云元数据接口 169.254.169.254）</li>
     *   <li>{@code isSiteLocalAddress}：10/8、172.16/12、192.168/16</li>
     *   <li>{@code isMulticastAddress}：组播地址</li>
     * </ul>
     */
    public static boolean isInternalAddress(InetAddress addr) {
        return addr.isAnyLocalAddress()
                || addr.isLoopbackAddress()
                || addr.isLinkLocalAddress()
                || addr.isSiteLocalAddress()
                || addr.isMulticastAddress();
    }

    /**
     * 便捷方法：将逗号分隔的 scheme 字符串解析为小写集合。空串返回空集。
     */
    public static Set<String> parseSchemes(String csv) {
        if (csv == null || csv.isBlank()) {
            return Set.of();
        }
        return Stream.of(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }
}

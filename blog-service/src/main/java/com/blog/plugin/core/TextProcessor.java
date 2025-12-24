package com.blog.plugin.core;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class TextProcessor {
    
    private static final List<String> DEFAULT_SENSITIVE_WORDS = new ArrayList<>();
    private static final Pattern URL_PATTERN = Pattern.compile("https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+", Pattern.CASE_INSENSITIVE);
    private static final int MAX_URL_COUNT = 3;
    private static final int MIN_CONTENT_LENGTH = 5;
    
    public static String cleanContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }
        
        String processed = content.trim();
        processed = Jsoup.clean(processed, Safelist.none());
        processed = filterSensitiveWords(processed);
        
        return processed;
    }
    
    public static boolean isSpam(String content, String ip, Long userId) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }
        
        int urlCount = 0;
        java.util.regex.Matcher matcher = URL_PATTERN.matcher(content);
        while (matcher.find()) {
            urlCount++;
        }
        if (urlCount > MAX_URL_COUNT) {
            return true;
        }
        
        if (content.length() < MIN_CONTENT_LENGTH) {
            return true;
        }
        
        String spamPattern = "(?i)(广告|推广|加微信|加qq|点击|链接|www\\.|http)";
        if (Pattern.compile(spamPattern).matcher(content).find()) {
            return true;
        }
        
        return false;
    }
    
    public static String filterSensitiveWords(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }
        
        String result = content;
        for (String word : DEFAULT_SENSITIVE_WORDS) {
            if (word != null && !word.trim().isEmpty()) {
                result = result.replaceAll("(?i)" + Pattern.quote(word), "***");
            }
        }
        
        return result;
    }
}


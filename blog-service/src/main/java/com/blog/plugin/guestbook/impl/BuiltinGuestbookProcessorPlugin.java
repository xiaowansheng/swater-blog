package com.blog.plugin.guestbook.impl;

import com.blog.model.dto.GuestbookDTO;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.ProcessResult;
import com.blog.plugin.guestbook.GuestbookProcessorPlugin;
import com.blog.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Component
@ConditionalOnProperty(name = "guestbook.processor.type", havingValue = "builtin", matchIfMissing = true)
public class BuiltinGuestbookProcessorPlugin implements GuestbookProcessorPlugin, Plugin {
    
    private static final List<String> DEFAULT_SENSITIVE_WORDS = new ArrayList<>();
    private static final Pattern URL_PATTERN = Pattern.compile("https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+", Pattern.CASE_INSENSITIVE);
    private static final int MAX_URL_COUNT = 3;
    private static final int MIN_CONTENT_LENGTH = 5;
    
    @Override
    public String getName() {
        return "builtin";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public String processContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }
        
        String processed = content.trim();
        
        processed = Jsoup.clean(processed, Safelist.none());
        
        processed = filterSensitiveWords(processed);
        
        return processed;
    }
    
    @Override
    public boolean isSpam(String content, String ip, Long userId) {
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
    
    @Override
    public ProcessResult process(GuestbookDTO dto) {
        ProcessResult result = new ProcessResult();
        
        if (dto == null || dto.getContent() == null) {
            result.setProcessedContent("");
            result.setSpam(false);
            result.setApproved(false);
            result.setReason("留言内容为空");
            return result;
        }
        
        String processedContent = processContent(dto.getContent());
        result.setProcessedContent(processedContent);
        
        String ip = RequestUtil.getClientIp();
        Long userId = null;
        try {
            if (cn.dev33.satoken.stp.StpUtil.isLogin()) {
                userId = cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong();
            }
        } catch (Exception e) {
            // ignore
        }
        
        boolean spam = isSpam(processedContent, ip, userId);
        result.setSpam(spam);
        
        if (spam) {
            result.setApproved(false);
            result.setReason("检测到垃圾留言");
            result.addMetadata("spamReason", "内容包含垃圾信息");
        } else {
            result.setApproved(true);
            result.setReason("审核通过");
        }
        
        result.addMetadata("originalLength", dto.getContent().length());
        result.addMetadata("processedLength", processedContent.length());
        result.addMetadata("ip", ip);
        
        return result;
    }
    
    private String filterSensitiveWords(String content) {
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


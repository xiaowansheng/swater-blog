package com.blog.plugin.components.guestbook.impl;


import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.ProcessResult;
import com.blog.plugin.core.TextProcessor;
import com.blog.plugin.components.guestbook.GuestbookProcessorPlugin;
import com.blog.shared.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@ConditionalOnProperty(name = "guestbook.processor.type", havingValue = "builtin", matchIfMissing = true)
public class BuiltinGuestbookProcessorPlugin implements GuestbookProcessorPlugin, Plugin {
    
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
        return TextProcessor.cleanContent(content);
    }
    
    @Override
    public boolean isSpam(String content, String ip, Long userId) {
        return TextProcessor.isSpam(content, ip, userId);
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
}


package com.blog.core.plugin.comment.processor.impl;


import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.core.plugin.comment.processor.CommentProcessorPlugin;
import com.blog.core.plugin.core.Plugin;
import com.blog.core.plugin.core.ProcessResult;
import com.blog.core.plugin.core.TextProcessor;
import com.blog.common.util.RequestUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Slf4j
@Component
@ConditionalOnProperty(name = "comment.processor.type", havingValue = "builtin", matchIfMissing = true)
public class BuiltinCommentProcessorPlugin implements CommentProcessorPlugin, Plugin {
    
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
    public ProcessResult process(CommentDTO dto) {
        ProcessResult result = new ProcessResult();
        
        if (dto == null || dto.getContent() == null) {
            result.setProcessedContent("");
            result.setSpam(false);
            result.setApproved(false);
            result.setReason("评论内容为空");
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
            result.setReason("检测到垃圾评论");
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


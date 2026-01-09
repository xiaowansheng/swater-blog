package com.blog.plugin.components.text.impl;

import com.blog.plugin.components.text.TextProcessorPlugin;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.ProcessResult;
import com.blog.plugin.core.TextProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 内置文本处理插件
 * 统一处理评论、留言等文本内容
 */
@Slf4j
@Component
@ConditionalOnProperty(
    name = "text.processor.type",
    havingValue = "builtin",
    matchIfMissing = true
)
public class BuiltinTextProcessorPlugin implements TextProcessorPlugin, Plugin {

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
    public ProcessResult process(String content, String ip, Long userId) {
        ProcessResult result = new ProcessResult();

        if (content == null || content.isEmpty()) {
            result.setProcessedContent("");
            result.setSpam(false);
            result.setApproved(false);
            result.setReason("内容为空");
            return result;
        }

        String processedContent = processContent(content);
        result.setProcessedContent(processedContent);

        boolean spam = isSpam(processedContent, ip, userId);
        result.setSpam(spam);

        if (spam) {
            result.setApproved(false);
            result.setReason("检测到垃圾信息");
            result.addMetadata("spamReason", "内容包含垃圾信息");
        } else {
            result.setApproved(true);
            result.setReason("审核通过");
        }

        result.addMetadata("originalLength", content.length());
        result.addMetadata("processedLength", processedContent.length());
        result.addMetadata("ip", ip);

        return result;
    }
}

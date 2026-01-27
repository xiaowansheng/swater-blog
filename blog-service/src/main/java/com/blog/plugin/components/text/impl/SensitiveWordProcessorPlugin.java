package com.blog.plugin.components.text.impl;

import com.blog.plugin.components.text.ProcessResult;
import com.blog.plugin.components.text.TextProcessorPlugin;
import com.blog.plugin.core.Plugin;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 内置敏感词处理插件
 * 用于处理评论、留言等文本内容中的敏感词
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.text.active", havingValue = "sensitive-word", matchIfMissing = false)
public class SensitiveWordProcessorPlugin implements TextProcessorPlugin, Plugin {

    private static final List<String> DEFAULT_SENSITIVE_WORDS = new ArrayList<>();

    @Override
    public String getName() {
        return "sensitive-word";
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public ProcessResult process(String content) {
        if (content == null || content.isEmpty()) {
            return new ProcessResult("");
        }

        String processedContent = processContent(content);
        boolean hasSensitiveWords = containsSensitiveWords(content);

        ProcessResult result = new ProcessResult(processedContent);
        result.addMetadata("originalLength", content.length());
        result.addMetadata("processedLength", processedContent.length());
        result.addMetadata("hasSensitiveWords", hasSensitiveWords);

        return result;
    }

    /**
     * 处理内容（清理HTML、过滤敏感词等）
     *
     * @param content 原始内容
     * @return 处理后的内容
     */
    private String processContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }

        String processed = content.trim();
        processed = Jsoup.clean(processed, Safelist.none());
        processed = processSensitiveWords(processed, "*");

        return processed;
    }

    /**
     * 检查内容是否包含敏感词
     *
     * @param content 待检查的内容
     * @return 是否包含敏感词
     */
    private boolean containsSensitiveWords(String content) {
        if (content == null || content.isEmpty()) {
            return false;
        }

        String lowerContent = content.toLowerCase();
        for (String word : DEFAULT_SENSITIVE_WORDS) {
            if (word != null && !word.trim().isEmpty() && lowerContent.contains(word.toLowerCase())) {
                return true;
            }
        }

        return false;
    }

    /**
     * 处理敏感词（如替换、屏蔽等）
     *
     * @param content 包含敏感词的内容
     * @param replacement 替换字符（如 *、# 等），传 null 则使用默认替换方式
     * @return 处理后的内容
     */
    private String processSensitiveWords(String content, String replacement) {
        if (content == null || content.isEmpty()) {
            return content;
        }

        String repl = replacement != null ? replacement : "*";
        String result = content;

        for (String word : DEFAULT_SENSITIVE_WORDS) {
            if (word != null && !word.trim().isEmpty()) {
                String masked = repl.repeat(word.length());
                result = result.replaceAll("(?i)" + Pattern.quote(word), masked);
            }
        }

        return result;
    }
}

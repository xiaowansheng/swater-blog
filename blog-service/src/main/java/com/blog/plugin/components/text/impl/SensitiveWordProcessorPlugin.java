package com.blog.plugin.components.text.impl;

import com.blog.plugin.components.text.ProcessResult;
import com.blog.plugin.components.text.TextProcessorPlugin;
import com.blog.plugin.core.Plugin;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

import com.github.houbb.sensitive.word.bs.SensitiveWordBs;
import com.github.houbb.sensitive.word.support.allow.WordAllows;
import com.github.houbb.sensitive.word.support.deny.WordDenys;

@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.text.active", havingValue = "sensitive-word", matchIfMissing = false)
public class SensitiveWordProcessorPlugin implements TextProcessorPlugin, Plugin {

    private SensitiveWordBs sensitiveWordBs;

    @PostConstruct
    public void init() {
        this.sensitiveWordBs = SensitiveWordBs.newInstance()
                .wordDeny(WordDenys.defaults())
                .wordAllow(WordAllows.defaults())
                // 各种忽略策略（文档里有这些）
                .ignoreCase(true)
                .ignoreWidth(true)
                .ignoreNumStyle(true)
                .ignoreChineseStyle(true)
                .ignoreEnglishStyle(true)
                .ignoreRepeat(true)
                // 检测类型
                .enableNumCheck(true)
                .enableEmailCheck(true)
                .enableUrlCheck(true)   // URL 检测是这样开启的（不是 ignoreUrl）:contentReference[oaicite:2]{index=2}
                .init();

        log.info("SensitiveWordProcessorPlugin 初始化完成");
    }

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
        if (content == null || content.isBlank()) {
            return new ProcessResult("");
        }

        // 统一：先清理 HTML，再做检测/替换/找词，避免“检测到但替换不到”的不一致
        String normalized = normalize(content);

        boolean hasSensitiveWords = containsSensitiveWords(normalized);

        // SensitiveWordBs 文档示例：replace(text) 默认用 * 替换 :contentReference[oaicite:3]{index=3}
        String processedContent = hasSensitiveWords
                ? sensitiveWordBs.replace(normalized)
                : normalized;

        List<String> foundWords = hasSensitiveWords
                ? findSensitiveWords(normalized)
                : Collections.emptyList();

        ProcessResult result = new ProcessResult(processedContent);
        result.addMetadata("originalLength", content.length());
        result.addMetadata("normalizedLength", normalized.length());
        result.addMetadata("processedLength", processedContent.length());
        result.addMetadata("hasSensitiveWords", hasSensitiveWords);

        if (!foundWords.isEmpty()) {
            result.addMetadata("sensitiveWords", foundWords);
            result.addMetadata("sensitiveWordCount", foundWords.size());
        }

        return result;
    }

    private String normalize(String content) {
        return Jsoup.clean(content.trim(), Safelist.none());
    }

    private boolean containsSensitiveWords(String content) {
        return content != null && !content.isEmpty() && sensitiveWordBs.contains(content);
    }

    private List<String> findSensitiveWords(String content) {
        return (content == null || content.isEmpty())
                ? Collections.emptyList()
                : sensitiveWordBs.findAll(content);
    }
}

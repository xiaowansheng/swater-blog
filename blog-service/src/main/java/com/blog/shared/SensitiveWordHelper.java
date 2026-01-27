package com.blog.shared;

import com.github.houbb.sensitive.word.bs.SensitiveWordBs;
import com.github.houbb.sensitive.word.support.allow.WordAllows;
import com.github.houbb.sensitive.word.support.deny.WordDenys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * 敏感词处理助手类
 * 提供敏感词检测、查找、替换等核心功能
 */
@Slf4j
@Component
public class SensitiveWordHelper {

    private SensitiveWordBs sensitiveWordBs;

    @PostConstruct
    public void init() {
        this.sensitiveWordBs = SensitiveWordBs.newInstance()
                .wordDeny(WordDenys.defaults())
                .wordAllow(WordAllows.defaults())
                // 各种忽略策略
                .ignoreCase(true)
                .ignoreWidth(true)
                .ignoreNumStyle(true)
                .ignoreChineseStyle(true)
                .ignoreEnglishStyle(true)
                .ignoreRepeat(true)
                // 检测类型
                .enableNumCheck(true)
                .enableEmailCheck(true)
                .enableUrlCheck(true)
                .init();

        log.info("SensitiveWordHelper 初始化完成");
    }

    /**
     * 检查内容是否包含敏感词
     *
     * @param content 待检查的内容
     * @return 是否包含敏感词
     */
    public boolean contains(String content) {
        if (content == null || content.isEmpty()) {
            return false;
        }
        return sensitiveWordBs.contains(content);
    }

    /**
     * 查找内容中的所有敏感词
     *
     * @param content 待检查的内容
     * @return 敏感词列表
     */
    public List<String> findAll(String content) {
        if (content == null || content.isEmpty()) {
            return Collections.emptyList();
        }
        return sensitiveWordBs.findAll(content);
    }

    /**
     * 查找内容中第一个敏感词
     *
     * @param content 待检查的内容
     * @return 第一个敏感词，不存在返回 null
     */
    public String findFirst(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }
        return sensitiveWordBs.findFirst(content);
    }

    /**
     * 替换敏感词（默认使用 * 替换）
     *
     * @param content 包含敏感词的内容
     * @return 替换后的内容
     */
    public String replace(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }
        return sensitiveWordBs.replace(content);
    }

    /**
     * 替换敏感词（指定替换字符）
     *
     * @param content 包含敏感词的内容
     * @param replacement 替换字符
     * @return 替换后的内容
     */
    public String replace(String content, char replacement) {
        if (content == null || content.isEmpty()) {
            return content;
        }
        // The library version in this project only supports replace(String),
        // so we implement custom replacement with the requested character.
        List<String> sensitiveWords = sensitiveWordBs.findAll(content);
        if (sensitiveWords.isEmpty()) {
            return content;
        }
        String result = content;
        for (String word : sensitiveWords) {
            if (word == null || word.isEmpty()) {
                continue;
            }
            String mask = String.valueOf(replacement).repeat(word.length());
            result = result.replace(word, mask);
        }
        return result;
    }

    /**
     * 标准化内容：清理 HTML 标签
     *
     * @param content 原始内容
     * @return 标准化后的内容
     */
    public String normalize(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }
        return Jsoup.clean(content.trim(), Safelist.none());
    }

    /**
     * 检查并替换敏感词（一次性操作）
     *
     * @param content 原始内容
     * @return 替换后的内容
     */
    public String clean(String content) {
        String normalized = normalize(content);
        if (contains(normalized)) {
            return replace(normalized);
        }
        return normalized;
    }

    /**
     * 统计敏感词数量
     *
     * @param content 待检查的内容
     * @return 敏感词数量
     */
    public int count(String content) {
        return findAll(content).size();
    }
}

package com.blog.shared;

import com.github.houbb.sensitive.word.api.IWordDeny;
import com.github.houbb.sensitive.word.bs.SensitiveWordBs;
import com.github.houbb.sensitive.word.support.allow.WordAllows;
import com.github.houbb.sensitive.word.support.deny.WordDenys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * 敏感词处理助手类
 * 提供敏感词检测、查找、替换等核心功能
 *
 * 词库来源：
 * 1) houbb sensitive-word 默认内置词库（wordDeny/wordAllow defaults）
 * 2) 数据库配置的自定义敏感词（经 {@link SensitiveWordConfigProvider} SPI 注入，
 *    shared 层不直接依赖业务模块）
 *
 * 当管理员更新评论配置后，可调用 {@link #reloadCustomWords()} 热加载自定义词，无需重启。
 */
@Slf4j
@Component
public class SensitiveWordHelper {

    /**
     * 数据库中读取的自定义敏感词；为不可变快照，供 reload 时整体替换。
     */
    private volatile List<String> customWords = Collections.emptyList();

    private volatile SensitiveWordBs sensitiveWordBs;

    @Autowired(required = false)
    private SensitiveWordConfigProvider configProvider;

    @PostConstruct
    public void init() {
        // 启动时加载一次数据库自定义敏感词（若配置提供者尚未就绪则跳过，使用默认词库）
        loadCustomWordsFromConfig();
        rebuildBs();
        log.info("SensitiveWordHelper 初始化完成，自定义敏感词数量: {}", customWords.size());
    }

    /**
     * 从配置提供者加载自定义敏感词。
     */
    private void loadCustomWordsFromConfig() {
        if (configProvider == null) {
            return;
        }
        try {
            customWords = configProvider.loadCustomWords();
        } catch (Exception e) {
            log.warn("加载自定义敏感词失败，使用空自定义词库: {}", e.getMessage());
            customWords = Collections.emptyList();
        }
    }

    /**
     * 用默认词库 + 当前自定义词库重建底层 SensitiveWordBs。
     */
    private void rebuildBs() {
        IWordDeny wordDeny;
        if (customWords.isEmpty()) {
            wordDeny = WordDenys.defaults();
        } else {
            // 链式合并：默认禁用词 + 自定义禁用词
            wordDeny = WordDenys.chains(WordDenys.defaults(), new CustomWordDeny(customWords));
        }
        this.sensitiveWordBs = SensitiveWordBs.newInstance()
                .wordDeny(wordDeny)
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
    }

    /**
     * 重新加载数据库自定义敏感词并重建词库。供评论配置更新事件调用。
     */
    public synchronized void reloadCustomWords() {
        int before = customWords.size();
        loadCustomWordsFromConfig();
        rebuildBs();
        log.info("自定义敏感词已重新加载: {} -> {}", before, customWords.size());
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

    /**
     * 自定义禁用词实现：把数据库配置的敏感词作为禁用词返回。
     */
    private static final class CustomWordDeny implements IWordDeny {
        private final List<String> words;

        CustomWordDeny(List<String> words) {
            this.words = words;
        }

        @Override
        public List<String> deny() {
            return words;
        }
    }
}

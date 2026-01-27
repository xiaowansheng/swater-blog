package com.blog.plugin.core;


import lombok.Data;
import java.util.HashMap;
import java.util.Map;

/**
 * 文本处理结果
 * 通用的文本处理结果对象，用于返回处理后的内容及相关信息
 */
@Data
public class ProcessResult {
    /**
     * 处理后的内容
     */
    private String processedContent;

    /**
     * 处理原因或说明（如：包含敏感词、格式化等）
     */
    private String reason;

    /**
     * 额外的元数据信息（如：原始长度、处理后长度、检测到的敏感词列表等）
     */
    private Map<String, Object> metadata;

    public ProcessResult() {
        this.metadata = new HashMap<>();
    }

    public ProcessResult(String processedContent) {
        this.processedContent = processedContent;
        this.metadata = new HashMap<>();
    }

    public ProcessResult(String processedContent, String reason) {
        this.processedContent = processedContent;
        this.reason = reason;
        this.metadata = new HashMap<>();
    }

    /**
     * 添加元数据
     *
     * @param key 键
     * @param value 值
     */
    public void addMetadata(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        this.metadata.put(key, value);
    }

    /**
     * 获取元数据
     *
     * @param key 键
     * @param defaultValue 默认值
     * @return 值
     */
    public Object getMetadata(String key, Object defaultValue) {
        if (this.metadata == null) {
            return defaultValue;
        }
        return this.metadata.getOrDefault(key, defaultValue);
    }
}


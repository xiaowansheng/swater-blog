package com.blog.plugin.components.text;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 文本处理插件工厂
 */
@Component
public class TextProcessorFactory {

    private final List<TextProcessorPlugin> processors;

    @Autowired
    public TextProcessorFactory(List<TextProcessorPlugin> processors) {
        this.processors = processors;
    }

    /**
     * 获取所有可用的文本处理器
     */
    public List<TextProcessorPlugin> getProcessors() {
        return processors.stream()
                .filter(TextProcessorPlugin::isEnabled)
                .collect(Collectors.toList());
    }

    /**
     * 获取活动的文本处理器
     */
    public TextProcessorPlugin getActiveProcessor() {
        return processors.stream()
                .filter(TextProcessorPlugin::isEnabled)
                .findFirst()
                .orElse(null);
    }
}

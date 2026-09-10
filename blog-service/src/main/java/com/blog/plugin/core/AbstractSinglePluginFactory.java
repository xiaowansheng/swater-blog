package com.blog.plugin.core;


import java.util.List;
import java.util.stream.Collectors;

/**
 * 单插件族工厂抽象基类
 * <p>
 * 适用于同一插件族仅允许一个插件处于启用状态的场景（search、storage、mq）。
 * 子类负责提供已过滤的插件列表与展示信息，{@link #getActivePlugin()} 提供统一的
 * fail-fast 单选逻辑：无可用插件或多插件同时启用时立即抛出异常。
 * </p>
 */
public abstract class AbstractSinglePluginFactory<T extends Plugin> {

    /**
     * 获取启用状态下的插件列表（通常由子类基于 {@code isEnabled()} 过滤）
     */
    public abstract List<T> getPlugins();

    /**
     * 插件族展示名（用于错误消息，如 "search"、"storage"）
     */
    protected abstract String getPluginTypeName();

    /**
     * 插件族启用配置项（用于错误消息，如 "plugin.search.active"）
     */
    protected abstract String getConfigPropertyKey();

    /**
     * 获取唯一启用的插件
     *
     * @throws IllegalStateException 无可用插件或存在多个启用插件时
     */
    public T getActivePlugin() {
        List<T> plugins = getPlugins();
        if (plugins.isEmpty()) {
            throw new IllegalStateException("No active " + getPluginTypeName()
                    + " plugin found. Please configure " + getConfigPropertyKey() + " property.");
        }
        if (plugins.size() > 1) {
            throw new IllegalStateException("Multiple " + getPluginTypeName()
                    + " plugins are active: "
                    + plugins.stream().map(Plugin::getName).collect(Collectors.joining(", "))
                    + ". Only one should be active.");
        }
        return plugins.get(0);
    }
}

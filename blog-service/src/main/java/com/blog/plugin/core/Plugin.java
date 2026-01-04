package com.blog.plugin.core;

/**
 * 插件核心接口
 */
public interface Plugin {
    /**
     * 插件是否启用
     */
    boolean isEnabled();
    
    /**
     * 插件名称
     */
    String getName();
    
    /**
     * 插件版本
     */
    String getVersion();
}

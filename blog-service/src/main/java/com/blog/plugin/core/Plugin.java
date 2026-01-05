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
     * 插件名称（展示名）
     */
    String getName();
    
    /**
     * 插件唯一标识，默认使用名称的小写形式
     */
    default String getId() {
        return getName() != null ? getName().toLowerCase() : "";
    }

    /**
     * 插件优先级，数值越大优先级越高
     */
    default int getPriority() {
        return 0;
    }
    
    /**
     * 插件版本，未显式实现时提供默认版本号
     */
    default String getVersion() {
        return "1.0.0";
    }
}

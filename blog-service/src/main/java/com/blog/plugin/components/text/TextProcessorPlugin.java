package com.blog.plugin.components.text;

import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.ProcessResult;

/**
 * 统一的文本处理插件接口
 * 用于处理评论、留言等文本内容
 */
public interface TextProcessorPlugin extends Plugin {

    /**
     * 处理内容（清理HTML、过滤敏感词等）
     *
     * @param content 原始内容
     * @return 处理后的内容
     */
    String processContent(String content);

    /**
     * 检查是否为垃圾信息
     *
     * @param content 内容
     * @param ip      IP地址
     * @param userId  用户ID
     * @return 是否为垃圾信息
     */
    boolean isSpam(String content, String ip, Long userId);

    /**
     * 处理文本内容并返回处理结果
     *
     * @param content 内容
     * @param ip      IP地址
     * @param userId  用户ID
     * @return 处理结果
     */
    ProcessResult process(String content, String ip, Long userId);
}

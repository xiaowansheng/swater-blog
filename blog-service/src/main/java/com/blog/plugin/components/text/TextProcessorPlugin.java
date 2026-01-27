package com.blog.plugin.components.text;

import com.blog.plugin.core.Plugin;

/**
 * 统一的文本处理插件接口
 * 用于处理评论、留言等文本内容
 */
public interface TextProcessorPlugin extends Plugin {

    /**
     * 处理文本内容并返回处理结果
     *
     * @param content 内容
     * @return 处理结果
     */
    ProcessResult process(String content);
}

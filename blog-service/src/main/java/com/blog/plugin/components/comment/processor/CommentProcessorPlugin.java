package com.blog.plugin.components.comment.processor;


import com.blog.modules.comment.model.dto.CommentDTO;
import com.blog.plugin.core.ProcessResult;
public interface CommentProcessorPlugin {
    String processContent(String content);
    
    boolean isSpam(String content, String ip, Long userId);
    
    ProcessResult process(CommentDTO dto);
}


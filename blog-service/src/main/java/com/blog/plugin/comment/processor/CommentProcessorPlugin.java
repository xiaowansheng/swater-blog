package com.blog.plugin.comment.processor;

import com.blog.model.dto.CommentDTO;
import com.blog.plugin.core.ProcessResult;

public interface CommentProcessorPlugin {
    String processContent(String content);
    
    boolean isSpam(String content, String ip, Long userId);
    
    ProcessResult process(CommentDTO dto);
}


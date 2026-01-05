package com.blog.plugin.components.guestbook;


import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.plugin.core.ProcessResult;
public interface GuestbookProcessorPlugin {
    String processContent(String content);
    
    boolean isSpam(String content, String ip, Long userId);
    
    ProcessResult process(GuestbookDTO dto);
}


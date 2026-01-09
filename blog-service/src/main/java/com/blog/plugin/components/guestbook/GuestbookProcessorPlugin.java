package com.blog.plugin.components.guestbook;


import com.blog.plugin.core.Plugin;
import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.plugin.core.ProcessResult;

public interface GuestbookProcessorPlugin extends Plugin {
    String processContent(String content);

    boolean isSpam(String content);

    ProcessResult process(GuestbookDTO dto);
}


package com.blog.plugin.text;

import com.blog.model.dto.ArticleDTO;
import com.blog.plugin.core.ProcessResult;

public interface TextProcessorPlugin {
    String processMarkdown(String markdown);
    
    String processHtml(String html);
    
    String filterSensitiveWords(String text);
    
    String generateExcerpt(String content, int maxLength);
    
    ProcessResult processArticle(ArticleDTO dto);
}


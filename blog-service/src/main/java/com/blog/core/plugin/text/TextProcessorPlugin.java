package com.blog.core.plugin.text;


import com.blog.modules.article.model.dto.ArticleDTO;
import com.blog.core.plugin.core.ProcessResult;
public interface TextProcessorPlugin {
    String processMarkdown(String markdown);
    
    String processHtml(String html);
    
    String filterSensitiveWords(String text);
    
    String generateExcerpt(String content, int maxLength);
    
    ProcessResult processArticle(ArticleDTO dto);
}


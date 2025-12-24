package com.blog.plugin.text.impl;

import com.blog.model.dto.ArticleDTO;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.core.ProcessResult;
import com.blog.plugin.text.TextProcessorPlugin;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Component
@ConditionalOnProperty(name = "text.processor.type", havingValue = "builtin", matchIfMissing = true)
public class BuiltinTextProcessorPlugin implements TextProcessorPlugin, Plugin {
    
    private static final List<String> DEFAULT_SENSITIVE_WORDS = new ArrayList<>();
    private static final int DEFAULT_EXCERPT_LENGTH = 200;
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]+>");
    
    @Override
    public String getName() {
        return "builtin";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    public String processMarkdown(String markdown) {
        if (markdown == null || markdown.trim().isEmpty()) {
            return markdown;
        }
        
        String html = markdown;
        
        html = html.replaceAll("(?m)^#\\s+(.+)$", "<h1>$1</h1>");
        html = html.replaceAll("(?m)^##\\s+(.+)$", "<h2>$1</h2>");
        html = html.replaceAll("(?m)^###\\s+(.+)$", "<h3>$1</h3>");
        html = html.replaceAll("(?m)^####\\s+(.+)$", "<h4>$1</h4>");
        html = html.replaceAll("(?m)^#####\\s+(.+)$", "<h5>$1</h5>");
        html = html.replaceAll("(?m)^######\\s+(.+)$", "<h6>$1</h6>");
        
        html = html.replaceAll("\\*\\*(.+?)\\*\\*", "<strong>$1</strong>");
        html = html.replaceAll("\\*(.+?)\\*", "<em>$1</em>");
        html = html.replaceAll("`(.+?)`", "<code>$1</code>");
        
        html = html.replaceAll("\\[([^\\]]+)\\]\\(([^\\)]+)\\)", "<a href=\"$2\">$1</a>");
        
        html = html.replaceAll("(?m)^-\\s+(.+)$", "<li>$1</li>");
        html = html.replaceAll("(?m)^\\d+\\.\\s+(.+)$", "<li>$1</li>");
        
        html = html.replaceAll("(?m)^(.+)$", "<p>$1</p>");
        
        return html;
    }
    
    @Override
    public String processHtml(String html) {
        if (html == null || html.trim().isEmpty()) {
            return html;
        }
        
        Safelist safelist = Safelist.relaxed()
                .addTags("h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "strong", "em", "u", "s", "code", "pre", "blockquote")
                .addTags("ul", "ol", "li", "dl", "dt", "dd")
                .addTags("a", "img")
                .addAttributes("a", "href", "title", "target")
                .addAttributes("img", "src", "alt", "title", "width", "height");
        
        return Jsoup.clean(html, safelist);
    }
    
    @Override
    public String filterSensitiveWords(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        
        String result = text;
        for (String word : DEFAULT_SENSITIVE_WORDS) {
            if (word != null && !word.trim().isEmpty()) {
                result = result.replaceAll("(?i)" + Pattern.quote(word), "***");
            }
        }
        
        return result;
    }
    
    @Override
    public String generateExcerpt(String content, int maxLength) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        
        String plainText = HTML_TAG_PATTERN.matcher(content).replaceAll("");
        plainText = plainText.replaceAll("\\s+", " ").trim();
        
        if (plainText.length() <= maxLength) {
            return plainText;
        }
        
        String excerpt = plainText.substring(0, maxLength);
        int lastSpace = excerpt.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.8) {
            excerpt = excerpt.substring(0, lastSpace);
        }
        
        return excerpt + "...";
    }
    
    @Override
    public ProcessResult processArticle(ArticleDTO dto) {
        ProcessResult result = new ProcessResult();
        
        if (dto == null) {
            result.setProcessedContent("");
            result.setSpam(false);
            result.setApproved(false);
            result.setReason("文章数据为空");
            return result;
        }
        
        String content = dto.getContent();
        if (content == null || content.trim().isEmpty()) {
            result.setProcessedContent("");
            result.setSpam(false);
            result.setApproved(false);
            result.setReason("文章内容为空");
            return result;
        }
        
        String processedContent = content;
        
        if (dto.getType() != null && "markdown".equalsIgnoreCase(dto.getType())) {
            processedContent = processMarkdown(processedContent);
        }
        
        processedContent = processHtml(processedContent);
        
        processedContent = filterSensitiveWords(processedContent);
        
        result.setProcessedContent(processedContent);
        result.setSpam(false);
        result.setApproved(true);
        result.setReason("处理完成");
        
        if (dto.getExcerpt() == null || dto.getExcerpt().trim().isEmpty()) {
            String excerpt = generateExcerpt(processedContent, DEFAULT_EXCERPT_LENGTH);
            result.addMetadata("excerpt", excerpt);
        }
        
        result.addMetadata("originalLength", content.length());
        result.addMetadata("processedLength", processedContent.length());
        
        return result;
    }
}


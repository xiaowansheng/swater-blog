package com.blog.plugin.components.comment.processor;



import com.blog.plugin.components.text.TextProcessorFactory;
import com.blog.plugin.components.text.TextProcessorPlugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

/**
 * @deprecated 使用 {@link TextProcessorFactory} 替代
 */
@Deprecated
@Component
public class CommentProcessorFactory {

    @Autowired
    private TextProcessorFactory textProcessorFactory;

    /**
     * @deprecated 使用 {@link TextProcessorFactory#getProcessors()} 替代
     */
    @Deprecated
    public List<CommentProcessorPlugin> getProcessors() {
        TextProcessorPlugin processor = textProcessorFactory.getActiveProcessor();
        if (processor == null) {
            return Collections.emptyList();
        }
        // 将 TextProcessorPlugin 适配为 CommentProcessorPlugin
        return Collections.singletonList(new CommentProcessorPlugin() {
            @Override
            public String processContent(String content) {
                return processor.processContent(content);
            }

            @Override
            public boolean isSpam(String content) {
                return processor.isSpam(content);
            }

            @Override
            public com.blog.plugin.core.ProcessResult process(com.blog.modules.comment.model.dto.CommentDTO dto) {
                return processor.process(dto.getContent());
            }
        });
    }
}


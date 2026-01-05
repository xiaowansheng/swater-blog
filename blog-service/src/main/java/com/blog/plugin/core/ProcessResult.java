package com.blog.plugin.core;


import lombok.Data;
import java.util.HashMap;
import java.util.Map;
@Data
public class ProcessResult {
    private String processedContent;
    private boolean isSpam;
    private boolean isApproved;
    private String reason;
    private Map<String, Object> metadata;

    public ProcessResult() {
        this.metadata = new HashMap<>();
    }

    public ProcessResult(String processedContent, boolean isSpam, boolean isApproved) {
        this.processedContent = processedContent;
        this.isSpam = isSpam;
        this.isApproved = isApproved;
        this.metadata = new HashMap<>();
    }

    public void addMetadata(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        this.metadata.put(key, value);
    }
}


package com.blog.modules.system.config.model.dto.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class WebhookConfigDTO {
    private List<WebhookItem> webhooks = new ArrayList<>();

    @Data
    public static class WebhookItem {
        private String id;
        private String name;
        private String url;
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        private String secret;
        private List<String> events = new ArrayList<>();
        private boolean enabled = true;
    }
}

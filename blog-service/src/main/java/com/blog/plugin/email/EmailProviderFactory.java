package com.blog.plugin.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmailProviderFactory {
    
    @Autowired
    private List<EmailProviderPlugin> emailProviders;
    
    public EmailProviderPlugin getProvider() {
        return emailProviders.stream()
                .filter(provider -> provider instanceof com.blog.plugin.core.Plugin)
                .filter(provider -> ((com.blog.plugin.core.Plugin) provider).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

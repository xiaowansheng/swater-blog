package com.blog.plugin.email;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class EmailProviderFactory {
    
    @Autowired
    private List<EmailProviderPlugin> emailProviders;
    
    public List<EmailProviderPlugin> getProviders() {
        return emailProviders.stream()
                .filter(provider -> provider instanceof com.blog.plugin.core.Plugin)
                .filter(provider -> ((com.blog.plugin.core.Plugin) provider).isEnabled())
                .collect(Collectors.toList());
    }
}

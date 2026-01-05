package com.blog.plugin.components.location;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class LocationProviderFactory {
    
    @Autowired
    private List<LocationProviderPlugin> locationProviders;
    
    public List<LocationProviderPlugin> getProviders() {
        return locationProviders.stream()
                .filter(provider -> provider instanceof com.blog.plugin.core.Plugin)
                .filter(provider -> ((com.blog.plugin.core.Plugin) provider).isEnabled())
                .collect(Collectors.toList());
    }
}

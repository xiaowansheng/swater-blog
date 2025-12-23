package com.blog.plugin.location;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LocationProviderFactory {
    
    @Autowired
    private List<LocationProviderPlugin> locationProviders;
    
    public LocationProviderPlugin getProvider() {
        return locationProviders.stream()
                .filter(provider -> provider instanceof com.blog.plugin.core.Plugin)
                .filter(provider -> ((com.blog.plugin.core.Plugin) provider).isEnabled())
                .findFirst()
                .orElse(null);
    }
}

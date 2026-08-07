package com.blog.plugin.components.location;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
@Component
public class LocationProviderFactory {
    
    @Autowired
    private List<LocationProviderPlugin> locationProviders;
    
    public List<LocationProviderPlugin> getProviders() {
        return locationProviders;
    }
}

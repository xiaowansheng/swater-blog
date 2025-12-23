package com.blog.plugin.location.impl;

import com.blog.plugin.core.Plugin;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderPlugin;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "location.provider.type", havingValue = "ip2location")
public class Ip2LocationProviderPlugin implements LocationProviderPlugin, Plugin {
    
    @Value("${location.ip2location.db-path:}")
    private String dbPath;
    
    @Override
    public String getName() {
        return "ip2location";
    }
    
    @Override
    public boolean isEnabled() {
        return false;
    }
    
    @Override
    public LocationInfo getLocationInfo(String ip) throws Exception {
        throw new UnsupportedOperationException("IP2Location插件需要额外实现，请参考IP2Location Java SDK文档");
    }
}

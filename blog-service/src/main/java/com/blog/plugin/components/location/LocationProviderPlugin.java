package com.blog.plugin.components.location;


import com.blog.plugin.core.Plugin;

public interface LocationProviderPlugin extends Plugin {
    LocationInfo getLocationInfo(String ip);
}


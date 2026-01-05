package com.blog.plugin.components.location;

public interface LocationProviderPlugin {
    LocationInfo getLocationInfo(String ip) throws Exception;
}

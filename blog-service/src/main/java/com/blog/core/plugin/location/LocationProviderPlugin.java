package com.blog.core.plugin.location;

public interface LocationProviderPlugin {
    LocationInfo getLocationInfo(String ip) throws Exception;
}

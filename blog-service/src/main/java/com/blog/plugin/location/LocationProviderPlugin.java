package com.blog.plugin.location;

public interface LocationProviderPlugin {
    LocationInfo getLocationInfo(String ip) throws Exception;
}

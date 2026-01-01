package com.blog.plugin.location.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderPlugin;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "location.provider.type", havingValue = "amap", matchIfMissing = true)
public class AmapLocationProviderPlugin implements LocationProviderPlugin, Plugin {
    
    @Value("${location.amap.key:}")
    private String apiKey;
    
    @Value("${location.amap.api-url:https://restapi.amap.com/v3/ip}")
    private String apiUrl;
    
    @Override
    public String getName() {
        return "amap";
    }
    
    @Override
    public boolean isEnabled() {
        return StrUtil.isNotBlank(apiKey);
    }
    
    @Override
    public LocationInfo getLocationInfo(String ip) throws Exception {
        if (StrUtil.isBlank(apiKey)) {
            throw new IllegalStateException("高德地图API Key未配置");
        }
        
        String url = apiUrl + "?key=" + apiKey + "&ip=" + ip;
        String response = HttpUtil.get(url);
        
        JSONObject jsonObject = JSONUtil.parseObj(response);
        
        if (!"1".equals(jsonObject.getStr("status"))) {
            throw new Exception("高德地图API调用失败: " + jsonObject.getStr("info"));
        }
        
        LocationInfo locationInfo = new LocationInfo();
        locationInfo.setCountry("中国");
        locationInfo.setProvince(jsonObject.getStr("province", ""));
        locationInfo.setCity(jsonObject.getStr("city", ""));
        locationInfo.setDistrict(jsonObject.getStr("district", ""));
        locationInfo.setLocation(jsonObject.getStr("province", "") + 
                jsonObject.getStr("city", "") + 
                jsonObject.getStr("district", ""));
        locationInfo.setIp(locationInfo.getLocation());
        
        return locationInfo;
    }
}

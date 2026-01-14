package com.blog.plugin.components.location.impl;


import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.location.LocationInfo;
import com.blog.plugin.components.location.LocationProviderPlugin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Slf4j
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
    public LocationInfo getLocationInfo(String ip) {
        if (StrUtil.isBlank(apiKey)) {
            log.warn("高德地图API Key未配置");
            return null;
        }

        try {
            String url = apiUrl + "?key=" + apiKey + "&ip=" + ip;
            String response = HttpUtil.get(url);

            JSONObject jsonObject = JSONUtil.parseObj(response);

            if (!"1".equals(jsonObject.getStr("status"))) {
                log.warn("高德地图API调用失败: {}, IP: {}", jsonObject.getStr("info"), ip);
                return null;
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
        } catch (Exception e) {
            log.warn("高德地图IP定位异常: {}, IP: {}", e.getMessage(), ip);
            return null;
        }
    }
}

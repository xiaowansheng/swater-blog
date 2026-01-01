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
@ConditionalOnProperty(name = "location.provider.type", havingValue = "baidu")
public class BaiduLocationProviderPlugin implements LocationProviderPlugin, Plugin {
    
    @Value("${location.baidu.ak:}")
    private String ak;
    
    @Value("${location.baidu.api-url:https://api.map.baidu.com/location/ip}")
    private String apiUrl;
    
    @Override
    public String getName() {
        return "baidu";
    }
    
    @Override
    public boolean isEnabled() {
        return StrUtil.isNotBlank(ak);
    }
    
    @Override
    public LocationInfo getLocationInfo(String ip) throws Exception {
        if (StrUtil.isBlank(ak)) {
            throw new IllegalStateException("百度地图AK未配置");
        }
        
        String url = apiUrl + "?ak=" + ak + "&ip=" + ip;
        String response = HttpUtil.get(url);
        
        JSONObject jsonObject = JSONUtil.parseObj(response);
        
        if (jsonObject.getInt("status", -1) != 0) {
            throw new Exception("百度地图API调用失败: " + jsonObject.getStr("message"));
        }
        
        JSONObject content = jsonObject.getJSONObject("content");
        JSONObject addressDetail = content.getJSONObject("address_detail");
        JSONObject point = content.getJSONObject("point");
        
        LocationInfo locationInfo = new LocationInfo();
        locationInfo.setCountry("中国");
        locationInfo.setProvince(addressDetail.getStr("province", ""));
        locationInfo.setCity(addressDetail.getStr("city", ""));
        locationInfo.setDistrict(addressDetail.getStr("district", ""));
        locationInfo.setLocation(content.getStr("address", ""));
        if (point != null) {
            locationInfo.setLatitude(new java.math.BigDecimal(point.getStr("y", "0")));
            locationInfo.setLongitude(new java.math.BigDecimal(point.getStr("x", "0")));
        }
        locationInfo.setIp(locationInfo.getLocation());
        
        return locationInfo;
    }
}

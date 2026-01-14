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
    public LocationInfo getLocationInfo(String ip) {
        if (StrUtil.isBlank(ak)) {
            log.warn("百度地图AK未配置");
            return null;
        }

        try {
            String url = apiUrl + "?ak=" + ak + "&ip=" + ip;
            String response = HttpUtil.get(url);

            JSONObject jsonObject = JSONUtil.parseObj(response);

            if (jsonObject.getInt("status", -1) != 0) {
                log.warn("百度地图API调用失败: {}, IP: {}", jsonObject.getStr("message"), ip);
                return null;
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
        } catch (Exception e) {
            log.warn("百度地图IP定位异常: {}, IP: {}", e.getMessage(), ip);
            return null;
        }
    }
}

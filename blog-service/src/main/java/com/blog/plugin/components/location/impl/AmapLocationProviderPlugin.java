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
@ConditionalOnProperty(name = "plugin.location.active", havingValue = "amap", matchIfMissing = false)
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
    
    /**
     * 清理位置字段值，处理空字符串和空数组
     */
    private String cleanLocationValue(String value) {
        if (StrUtil.isBlank(value) || "[]".equals(value)) {
            return "";
        }
        return value;
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

            // 检查是否查询到位置信息（空数组表示未查询到）
            String province = cleanLocationValue(jsonObject.getStr("province"));
            String city = cleanLocationValue(jsonObject.getStr("city"));
            String district = cleanLocationValue(jsonObject.getStr("district"));

            if (StrUtil.isBlank(province)) {
                log.debug("高德地图未查询到位置信息, IP: {}", ip);
                return null;
            }

            LocationInfo locationInfo = new LocationInfo();
            locationInfo.setCountry("中国");
            locationInfo.setProvince(province);
            locationInfo.setCity(city);
            locationInfo.setDistrict(district);
            locationInfo.setLocation(province + city + district);
            locationInfo.setIp(locationInfo.getLocation());

            return locationInfo;
        } catch (Exception e) {
            log.warn("高德地图IP定位异常: {}, IP: {}", e.getMessage(), ip);
            return null;
        }
    }
}

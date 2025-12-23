package com.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.blog.mapper.GuestbookMapper;
import com.blog.model.dto.GuestbookDTO;
import com.blog.model.entity.Guestbook;
import com.blog.model.vo.GuestbookVO;
import com.blog.plugin.location.LocationInfo;
import com.blog.plugin.location.LocationProviderFactory;
import com.blog.plugin.location.LocationProviderPlugin;
import com.blog.service.GuestbookPublicCommandService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.KeyUtil;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Slf4j
@Service
public class GuestbookPublicCommandServiceImpl implements GuestbookPublicCommandService {
    @Autowired
    private GuestbookMapper guestbookMapper;
    
    @Autowired(required = false)
    private LocationProviderFactory locationProviderFactory;

    @Override
    @Transactional
    public GuestbookVO submit(GuestbookDTO dto) {
        Guestbook guestbook = BeanUtil.copyProperties(dto, Guestbook.class);
        guestbook.setGuestbookKey(KeyUtil.generateKey("guestbook"));

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String ip = getClientIp(request);
        guestbook.setIp(ip);
        
        if (locationProviderFactory != null && ip != null) {
            try {
                LocationProviderPlugin locationProvider = locationProviderFactory.getProvider();
                if (locationProvider != null) {
                    LocationInfo locationInfo = locationProvider.getLocationInfo(ip);
                    if (locationInfo != null) {
                        guestbook.setCountry(locationInfo.getCountry());
                        guestbook.setProvince(locationInfo.getProvince());
                        guestbook.setCity(locationInfo.getCity());
                        guestbook.setLatitude(locationInfo.getLatitude());
                        guestbook.setLongitude(locationInfo.getLongitude());
                        guestbook.setLocationDetail(locationInfo.getLocationDetail());
                        if (locationInfo.getIpAddress() != null && !locationInfo.getIpAddress().isEmpty()) {
                            guestbook.setIpAddress(locationInfo.getIpAddress());
                        } else {
                            guestbook.setIpAddress(ip);
                        }
                        guestbook.setLocation(locationInfo.getLocationDetail() != null ? locationInfo.getLocationDetail() : 
                                (locationInfo.getProvince() != null && locationInfo.getCity() != null ? 
                                        locationInfo.getProvince() + locationInfo.getCity() : null));
                    } else {
                        guestbook.setIpAddress(ip);
                    }
                } else {
                    guestbook.setIpAddress(ip);
                }
            } catch (Exception e) {
                log.warn("IP定位失败，IP: {}", ip, e);
                guestbook.setIpAddress(ip);
            }
        } else {
            guestbook.setIpAddress(ip);
        }

        boolean isLogin = StpUtil.isLogin();
        if (isLogin) {
            Long userId = StpUtil.getLoginIdAsLong();
            guestbook.setUserId(userId);
            guestbook.setType("1");
        } else {
            if (dto.getNickname() != null && !dto.getNickname().isEmpty()) {
                guestbook.setType("2");
            } else {
                guestbook.setType("3");
            }
        }

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            guestbook.setImages(JsonUtil.toJson(dto.getImages()));
        }

        if (guestbook.getIsVisible() == null) {
            guestbook.setIsVisible(1);
        }
        if (guestbook.getReviewStatus() == null) {
            guestbook.setReviewStatus(0);
        }

        guestbookMapper.insert(guestbook);

        GuestbookVO vo = BeanUtil.copyProperties(guestbook, GuestbookVO.class);
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            vo.setImages(dto.getImages());
        }
        return vo;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}


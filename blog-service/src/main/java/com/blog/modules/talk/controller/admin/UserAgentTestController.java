package com.blog.modules.talk.controller.admin;

import com.blog.shared.Result;
import com.blog.shared.model.UserAgentInfo;
import com.blog.shared.util.UserAgentUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * User-Agent 测试控制器
 * 用于验证设备和浏览器信息解析是否正常
 */
@RestController
@RequestMapping("/admin/test")
@Tag(name = "测试接口", description = "用于测试User-Agent解析")
public class UserAgentTestController {

    @GetMapping("/useragent")
    @Operation(summary = "获取当前请求的User-Agent信息")
    public Result<Map<String, Object>> getUserAgentInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");

        UserAgentInfo info = UserAgentUtil.parse(userAgent);

        Map<String, Object> result = new HashMap<>();
        result.put("rawUserAgent", userAgent);
        result.put("deviceType", info.getDeviceType());
        result.put("deviceBrand", info.getDeviceBrand());
        result.put("deviceModel", info.getDeviceModel());
        result.put("deviceDescription", info.getDeviceDescription());
        result.put("osName", info.getOsName());
        result.put("osVersion", info.getOsVersion());
        result.put("osDescription", info.getOsDescription());
        result.put("browserName", info.getBrowserName());
        result.put("browserVersion", info.getBrowserVersion());
        result.put("browserDescription", info.getBrowserDescription());

        return Result.success(result);
    }
}

package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/config")
@ApiOperation(name = "配置公开接口", description = "网站配置相关接口", open = true)
public class ConfigPublicController {
    
    @Autowired
    private SiteConfigService siteConfigService;

    /**
     * 获取前台所有需要的配置（已过滤敏感信息）
     * 包含：网站信息、作者信息、封面配置、社交链接、隐私设置、评论设置
     */
    @GetMapping
    @ApiOperation(name = "获取公开配置", type = ApiOperationType.QUERY, description = "获取前台所有需要的配置，已过滤敏感信息")
    public Result<Map<String, Object>> getPublicConfig() {
        Map<String, Object> configs = siteConfigService.getPublicConfig();
        return Result.success(configs);
    }
}


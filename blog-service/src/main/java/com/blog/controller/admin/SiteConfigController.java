package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.dto.config.*;
import com.blog.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 网站配置管理控制器
 */
@RestController
@RequestMapping("/api/admin/site-config")
@ApiResource(name = "网站配置管理")
public class SiteConfigController {
    
    @Autowired
    private SiteConfigService siteConfigService;
    
    // ========== 网站信息 ==========
    
    @GetMapping("/site")
    public Result<SiteConfigDTO> getSiteConfig() {
        return Result.success(siteConfigService.getSiteConfig());
    }
    
    @PutMapping("/site")
    public Result<Void> updateSiteConfig(@RequestBody SiteConfigDTO config) {
        siteConfigService.updateSiteConfig(config);
        return Result.success();
    }
    
    // ========== 作者信息 ==========
    
    @GetMapping("/author")
    public Result<AuthorConfigDTO> getAuthorConfig() {
        return Result.success(siteConfigService.getAuthorConfig());
    }
    
    @PutMapping("/author")
    public Result<Void> updateAuthorConfig(@RequestBody AuthorConfigDTO config) {
        siteConfigService.updateAuthorConfig(config);
        return Result.success();
    }
    
    // ========== 封面配置 ==========
    
    @GetMapping("/cover")
    public Result<CoverConfigDTO> getCoverConfig() {
        return Result.success(siteConfigService.getCoverConfig());
    }
    
    @PutMapping("/cover")
    public Result<Void> updateCoverConfig(@RequestBody CoverConfigDTO config) {
        siteConfigService.updateCoverConfig(config);
        return Result.success();
    }
    
    // ========== 社交链接 ==========
    
    @GetMapping("/social")
    public Result<SocialConfigDTO> getSocialConfig() {
        return Result.success(siteConfigService.getSocialConfig());
    }
    
    @PutMapping("/social")
    public Result<Void> updateSocialConfig(@RequestBody SocialConfigDTO config) {
        siteConfigService.updateSocialConfig(config);
        return Result.success();
    }
    
    // ========== 隐私设置 ==========
    
    @GetMapping("/privacy")
    public Result<PrivacyConfigDTO> getPrivacyConfig() {
        return Result.success(siteConfigService.getPrivacyConfig());
    }
    
    @PutMapping("/privacy")
    public Result<Void> updatePrivacyConfig(@RequestBody PrivacyConfigDTO config) {
        siteConfigService.updatePrivacyConfig(config);
        return Result.success();
    }
    
    // ========== 评论设置 ==========
    
    @GetMapping("/comment")
    public Result<CommentConfigDTO> getCommentConfig() {
        return Result.success(siteConfigService.getCommentConfig());
    }
    
    @PutMapping("/comment")
    public Result<Void> updateCommentConfig(@RequestBody CommentConfigDTO config) {
        siteConfigService.updateCommentConfig(config);
        return Result.success();
    }
    
    // ========== 通知设置 ==========
    
    @GetMapping("/notify")
    public Result<NotifyConfigDTO> getNotifyConfig() {
        return Result.success(siteConfigService.getNotifyConfig());
    }
    
    @PutMapping("/notify")
    public Result<Void> updateNotifyConfig(@RequestBody NotifyConfigDTO config) {
        siteConfigService.updateNotifyConfig(config);
        return Result.success();
    }
    
    // ========== 上传设置 ==========
    
    @GetMapping("/upload")
    public Result<UploadConfigDTO> getUploadConfig() {
        return Result.success(siteConfigService.getUploadConfig());
    }
    
    @PutMapping("/upload")
    public Result<Void> updateUploadConfig(@RequestBody UploadConfigDTO config) {
        siteConfigService.updateUploadConfig(config);
        return Result.success();
    }
    
    // ========== 邮件设置 ==========
    
    @GetMapping("/email")
    public Result<EmailConfigDTO> getEmailConfig() {
        return Result.success(siteConfigService.getEmailConfig());
    }
    
    @PutMapping("/email")
    public Result<Void> updateEmailConfig(@RequestBody EmailConfigDTO config) {
        siteConfigService.updateEmailConfig(config);
        return Result.success();
    }
}

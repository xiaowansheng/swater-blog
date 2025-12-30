package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
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
@ApiOperation(value = "site-config", name = "网站配置管理模块", description = "网站配置管理接口", open = false)
public class SiteConfigController {

    @Autowired
    private SiteConfigService siteConfigService;

    // ========== 网站信息 ==========

    @GetMapping("/site")
    @ApiOperation(value = "getSite", name = "获取网站配置", type = ApiOperationType.QUERY, description = "获取网站信息配置")
    public Result<SiteConfigDTO> getSiteConfig() {
        return Result.success(siteConfigService.getSiteConfig());
    }

    @PutMapping("/site")
    @ApiOperation(value = "updateSite", name = "更新网站配置", type = ApiOperationType.UPDATE, description = "更新网站信息配置")
    public Result<Void> updateSiteConfig(@RequestBody SiteConfigDTO config) {
        siteConfigService.updateSiteConfig(config);
        return Result.success();
    }

    // ========== 作者信息 ==========

    @GetMapping("/author")
    @ApiOperation(value = "getAuthor", name = "获取作者配置", type = ApiOperationType.QUERY, description = "获取作者信息配置")
    public Result<AuthorConfigDTO> getAuthorConfig() {
        return Result.success(siteConfigService.getAuthorConfig());
    }

    @PutMapping("/author")
    @ApiOperation(value = "updateAuthor", name = "更新作者配置", type = ApiOperationType.UPDATE, description = "更新作者信息配置")
    public Result<Void> updateAuthorConfig(@RequestBody AuthorConfigDTO config) {
        siteConfigService.updateAuthorConfig(config);
        return Result.success();
    }

    // ========== 封面配置 ==========

    @GetMapping("/cover")
    @ApiOperation(value = "getCover", name = "获取封面配置", type = ApiOperationType.QUERY, description = "获取封面配置")
    public Result<CoverConfigDTO> getCoverConfig() {
        return Result.success(siteConfigService.getCoverConfig());
    }

    @PutMapping("/cover")
    @ApiOperation(value = "updateCover", name = "更新封面配置", type = ApiOperationType.UPDATE, description = "更新封面配置")
    public Result<Void> updateCoverConfig(@RequestBody CoverConfigDTO config) {
        siteConfigService.updateCoverConfig(config);
        return Result.success();
    }

    // ========== 社交链接 ==========

    @GetMapping("/social")
    @ApiOperation(value = "getSocial", name = "获取社交配置", type = ApiOperationType.QUERY, description = "获取社交链接配置")
    public Result<SocialConfigDTO> getSocialConfig() {
        return Result.success(siteConfigService.getSocialConfig());
    }

    @PutMapping("/social")
    @ApiOperation(value = "updateSocial", name = "更新社交配置", type = ApiOperationType.UPDATE, description = "更新社交链接配置")
    public Result<Void> updateSocialConfig(@RequestBody SocialConfigDTO config) {
        siteConfigService.updateSocialConfig(config);
        return Result.success();
    }

    // ========== 隐私设置 ==========

    @GetMapping("/privacy")
    @ApiOperation(value = "getPrivacy", name = "获取隐私配置", type = ApiOperationType.QUERY, description = "获取隐私设置配置")
    public Result<PrivacyConfigDTO> getPrivacyConfig() {
        return Result.success(siteConfigService.getPrivacyConfig());
    }

    @PutMapping("/privacy")
    @ApiOperation(value = "updatePrivacy", name = "更新隐私配置", type = ApiOperationType.UPDATE, description = "更新隐私设置配置")
    public Result<Void> updatePrivacyConfig(@RequestBody PrivacyConfigDTO config) {
        siteConfigService.updatePrivacyConfig(config);
        return Result.success();
    }

    // ========== 评论设置 ==========

    @GetMapping("/comment")
    @ApiOperation(value = "getComment", name = "获取评论配置", type = ApiOperationType.QUERY, description = "获取评论设置配置")
    public Result<CommentConfigDTO> getCommentConfig() {
        return Result.success(siteConfigService.getCommentConfig());
    }

    @PutMapping("/comment")
    @ApiOperation(value = "updateComment", name = "更新评论配置", type = ApiOperationType.UPDATE, description = "更新评论设置配置")
    public Result<Void> updateCommentConfig(@RequestBody CommentConfigDTO config) {
        siteConfigService.updateCommentConfig(config);
        return Result.success();
    }

    // ========== 通知设置 ==========

    @GetMapping("/notify")
    @ApiOperation(value = "getNotify", name = "获取通知配置", type = ApiOperationType.QUERY, description = "获取通知设置配置")
    public Result<NotifyConfigDTO> getNotifyConfig() {
        return Result.success(siteConfigService.getNotifyConfig());
    }

    @PutMapping("/notify")
    @ApiOperation(value = "updateNotify", name = "更新通知配置", type = ApiOperationType.UPDATE, description = "更新通知设置配置")
    public Result<Void> updateNotifyConfig(@RequestBody NotifyConfigDTO config) {
        siteConfigService.updateNotifyConfig(config);
        return Result.success();
    }

    // ========== 上传设置 ==========

    @GetMapping("/upload")
    @ApiOperation(value = "getUpload", name = "获取上传配置", type = ApiOperationType.QUERY, description = "获取上传设置配置")
    public Result<UploadConfigDTO> getUploadConfig() {
        return Result.success(siteConfigService.getUploadConfig());
    }

    @PutMapping("/upload")
    @ApiOperation(value = "updateUpload", name = "更新上传配置", type = ApiOperationType.UPDATE, description = "更新上传设置配置")
    public Result<Void> updateUploadConfig(@RequestBody UploadConfigDTO config) {
        siteConfigService.updateUploadConfig(config);
        return Result.success();
    }

    // ========== 邮件设置 ==========

    @GetMapping("/email")
    @ApiOperation(value = "getEmail", name = "获取邮件配置", type = ApiOperationType.QUERY, description = "获取邮件设置配置")
    public Result<EmailConfigDTO> getEmailConfig() {
        return Result.success(siteConfigService.getEmailConfig());
    }

    @PutMapping("/email")
    @ApiOperation(value = "updateEmail", name = "更新邮件配置", type = ApiOperationType.UPDATE, description = "更新邮件设置配置")
    public Result<Void> updateEmailConfig(@RequestBody EmailConfigDTO config) {
        siteConfigService.updateEmailConfig(config);
        return Result.success();
    }
}

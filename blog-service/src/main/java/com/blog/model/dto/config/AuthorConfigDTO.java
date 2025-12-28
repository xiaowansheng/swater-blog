package com.blog.model.dto.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

/**
 * 作者信息配置
 */
@Data
public class AuthorConfigDTO {
    private String name;
    private String avatar;
    private String signature;
    private String introduction;
    
    // 联系方式（根据showXxx决定是否返回给前台）
    private String email;
    private String qq;
    private String wechat;
    
    // 社交链接
    private String github;
    private String gitee;
    private String weibo;
    private String zhihu;
    private String bilibili;
    
    // 控制是否在前台显示联系方式
    private Boolean showEmail = false;
    private Boolean showQq = false;
    private Boolean showWechat = false;
    
    /**
     * 获取前台可见的作者信息（过滤敏感字段）
     */
    public AuthorConfigDTO toPublicView() {
        AuthorConfigDTO publicDTO = new AuthorConfigDTO();
        publicDTO.setName(this.name);
        publicDTO.setAvatar(this.avatar);
        publicDTO.setSignature(this.signature);
        publicDTO.setIntroduction(this.introduction);
        publicDTO.setGithub(this.github);
        publicDTO.setGitee(this.gitee);
        publicDTO.setWeibo(this.weibo);
        publicDTO.setZhihu(this.zhihu);
        publicDTO.setBilibili(this.bilibili);
        
        // 根据配置决定是否显示联系方式
        if (Boolean.TRUE.equals(this.showEmail)) {
            publicDTO.setEmail(this.email);
        }
        if (Boolean.TRUE.equals(this.showQq)) {
            publicDTO.setQq(this.qq);
        }
        if (Boolean.TRUE.equals(this.showWechat)) {
            publicDTO.setWechat(this.wechat);
        }
        
        return publicDTO;
    }
}

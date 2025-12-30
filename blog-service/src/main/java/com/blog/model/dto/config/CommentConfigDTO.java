package com.blog.model.dto.config;

import lombok.Data;

/**
 * 评论设置配置
 */
@Data
public class CommentConfigDTO {
    private Boolean enableAudit = true;     // 是否开启审核
    private Boolean allowAnonymous = false; // 是否允许匿名
    private Boolean allowGuest = true;      // 是否允许游客评论
    private Boolean showEmail = false;      // 是否显示邮箱
    
    /**
     * 获取前台可见的评论配置
     */
    public CommentConfigDTO toPublicView() {
        CommentConfigDTO publicDTO = new CommentConfigDTO();
        publicDTO.setAllowAnonymous(this.allowAnonymous);
        publicDTO.setAllowGuest(this.allowGuest);
        // enableAudit 和 showEmail 不返回给前台
        return publicDTO;
    }
}

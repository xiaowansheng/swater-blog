package com.blog.modules.system.config.model.dto.config;

import lombok.Data;

/**
 * 组件配置DTO
 * 用于控制前台各模块组件的显示
 */
@Data
public class ComponentConfigDTO {
    /**
     * 文章评论组件开关
     */
    private Boolean articleCommentEnabled;

    /**
     * 说说评论组件开关
     */
    private Boolean talkCommentEnabled;

    /**
     * 留言板留言组件开关
     */
    private Boolean guestbookMessageEnabled;

    // Manual setter methods (Lombok backup)
    public void setArticleCommentEnabled(Boolean articleCommentEnabled) {
        this.articleCommentEnabled = articleCommentEnabled;
    }

    public void setTalkCommentEnabled(Boolean talkCommentEnabled) {
        this.talkCommentEnabled = talkCommentEnabled;
    }

    public void setGuestbookMessageEnabled(Boolean guestbookMessageEnabled) {
        this.guestbookMessageEnabled = guestbookMessageEnabled;
    }

    // Manual getter methods (Lombok backup)
    public Boolean getArticleCommentEnabled() {
        return articleCommentEnabled;
    }

    public Boolean getTalkCommentEnabled() {
        return talkCommentEnabled;
    }

    public Boolean getGuestbookMessageEnabled() {
        return guestbookMessageEnabled;
    }
}

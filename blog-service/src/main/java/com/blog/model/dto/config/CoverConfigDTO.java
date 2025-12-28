package com.blog.model.dto.config;

import lombok.Data;

/**
 * 页面封面配置
 */
@Data
public class CoverConfigDTO {
    private String home;        // 首页封面
    private String article;     // 文章页封面
    private String archive;     // 归档页封面
    private String category;    // 分类页封面
    private String tag;         // 标签页封面
    private String talk;        // 说说页封面
    private String album;       // 相册页封面
    private String link;        // 友链页封面
    private String about;       // 关于页封面
    private String message;     // 留言页封面
    private String defaultCover; // 默认封面（字段名用default会冲突）
    
    // JSON中使用default，但Java中用defaultCover
    public String getDefault() {
        return defaultCover;
    }
    
    public void setDefault(String defaultCover) {
        this.defaultCover = defaultCover;
    }
}

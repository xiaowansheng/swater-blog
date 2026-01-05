package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.blog.common.model.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 评论实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("comment")
public class Comment extends BaseEntity {
    @TableField("article_id")
    private Long articleId;
    
    @TableField("user_id")
    private Long userId;
    
    private String content;
    
    @TableField("parent_id")
    private Long parentId;
    
    private Integer status;
    
    @TableField("target_id")
    private Long targetId;
    
    @TableField("target_type")
    private String targetType;
    
    // Manual setter methods (Lombok backup)
    public void setArticleId(Long articleId) { this.articleId = articleId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setContent(String content) { this.content = content; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public void setStatus(Integer status) { this.status = status; }
    
    // Manual getter methods (Lombok backup)
    public Long getArticleId() { return articleId; }
    public Long getUserId() { return userId; }
    public String getContent() { return content; }
    public Long getParentId() { return parentId; }
    public Integer getStatus() { return status; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
}

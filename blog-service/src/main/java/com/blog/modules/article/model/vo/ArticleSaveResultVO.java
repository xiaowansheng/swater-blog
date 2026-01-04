package com.blog.modules.article.model.vo;



import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
/**
 * 文章保存结果VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleSaveResultVO {
    /**
     * 文章ID
     */
    private Long id;

    /**
     * 文章唯一标识
     */
    private String articleKey;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 版本号（用于乐观锁）
     */
    private Long version;

    /**
     * 是否为新建
     */
    private Boolean isNew;

    /**
     * 是否为自动保存
     */
    private Boolean autoSave;

    /**
     * 文章状态
     */
    private Integer status;

    /**
     * 是否存在冲突
     */
    private Boolean hasConflict;

    /**
     * 冲突信息
     */
    private String conflictMessage;

    /**
     * 服务器端最新内容（冲突时返回）
     */
    private String serverContent;

    /**
     * 服务器端最新更新时间（冲突时返回）
     */
    private LocalDateTime serverUpdateTime;
}

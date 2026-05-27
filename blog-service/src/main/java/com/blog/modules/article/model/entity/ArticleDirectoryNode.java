package com.blog.modules.article.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.blog.shared.model.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("article_directory_node")
public class ArticleDirectoryNode extends BaseEntity {
    private String name;

    private String description;

    @TableField("parent_id")
    private Long parentId;

    private Integer sort;
}

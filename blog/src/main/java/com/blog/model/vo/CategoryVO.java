package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class CategoryVO extends BaseVO {
    private String categoryKey;

    private String name;

    private String slug;

    private String description;

    private Long parentId;

    private Integer sort;

    private String status;

    private List<CategoryVO> children;
}


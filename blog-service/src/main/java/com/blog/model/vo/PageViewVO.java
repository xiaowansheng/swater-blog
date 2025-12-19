package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PageViewVO extends BaseVO {
    private Long count;

    private String viewType;

    private Long viewId;
}


package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PageViewDTO extends BaseDTO {
    private String viewType;

    private Long viewId;

    private Long count;
}


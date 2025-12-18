package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class TagVO extends BaseVO {
    private String tagKey;

    private String name;

    private String slug;

    private String color;

    private String description;

    private String status;
}


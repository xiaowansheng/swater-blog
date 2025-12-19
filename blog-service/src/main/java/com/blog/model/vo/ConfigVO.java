package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ConfigVO extends BaseVO {
    private String configKey;

    private String name;

    private String value;

    private String type;

    private String description;

    private String groupName;

    private Integer sort;
}


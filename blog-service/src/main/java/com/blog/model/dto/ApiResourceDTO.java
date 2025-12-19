package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ApiResourceDTO extends BaseDTO {
    private String key;

    private String name;

    private String path;

    private String method;

    private String description;

    private Long parentId;

    private Integer isOpen;

    private String perms;

    private Integer sort;
}


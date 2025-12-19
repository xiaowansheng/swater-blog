package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class RoleVO extends BaseVO {
    private String name;

    private String code;

    private String roleKey;

    private String description;

    private Integer status;

    private Integer disabled;
}


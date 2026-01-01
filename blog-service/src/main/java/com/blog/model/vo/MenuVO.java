package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MenuVO extends BaseVO {
    private String title;

    private String icon;

    private String redirect;

    private String path;

    private String component;

    private Integer hidden;

    private Integer sort;

    private Long parentId;

    private String perms;

    private String description;

    private List<MenuVO> children;
}


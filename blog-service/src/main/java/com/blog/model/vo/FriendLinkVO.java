package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FriendLinkVO extends BaseVO {
    private String name;

    private String url;

    private String logo;

    private String description;

    private String author;

    private Integer status;

    private Integer isVisible;

    private Integer reviewStatus;

    private Integer sort;

    private Long userId;
}


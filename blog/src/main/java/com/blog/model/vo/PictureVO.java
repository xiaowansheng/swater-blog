package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PictureVO extends BaseVO {
    private Long userId;

    private String userName;

    private String userNickname;

    private Long albumId;

    private String albumName;

    private String name;

    private String description;

    private String url;

    private String source;

    private String status;
}


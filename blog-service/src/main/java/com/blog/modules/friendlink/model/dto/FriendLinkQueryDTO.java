package com.blog.modules.friendlink.model.dto;

import lombok.Data;

@Data
public class FriendLinkQueryDTO {
    private Long id;
    private Long userId;
    private String name;
    private String author;
    private String email;
    private String url;
    private Integer reviewStatus;
    private Integer isVisible;
}

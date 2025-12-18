package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class GuestbookVO extends BaseVO {
    private String guestbookKey;

    private String content;

    private List<String> images;

    private Long userId;

    private String userName;

    private String type;

    private String nickname;

    private String email;

    private String qq;

    private String ip;

    private String ipAddress;

    private String country;

    private String province;

    private String city;

    private Integer isVisible;

    private Integer reviewStatus;
}


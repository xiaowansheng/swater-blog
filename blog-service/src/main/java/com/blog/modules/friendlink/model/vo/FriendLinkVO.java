package com.blog.modules.friendlink.model.vo;



import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class FriendLinkVO extends com.blog.common.model.vo.BaseVO {
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


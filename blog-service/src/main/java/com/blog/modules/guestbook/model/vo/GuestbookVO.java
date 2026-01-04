package com.blog.modules.guestbook.model.vo;



import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class GuestbookVO extends com.blog.common.model.vo.BaseVO {
    private String content;

    private List<String> images;

    private Long userId;

    private String userName;

    private String type;

    private String nickname;

    private String email;

    private String qq;

    private String ip;

    private String country;

    private String province;

    private String city;

    private Integer isVisible;

    private Integer reviewStatus;
}


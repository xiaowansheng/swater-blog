package com.blog.modules.guestbook.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class GuestbookVO extends com.blog.shared.model.vo.BaseVO {
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

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String device;

    private String browser;

    private Integer isVisible;

    private Integer reviewStatus;
}


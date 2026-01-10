package com.blog.modules.comment.model.vo;



import com.blog.shared.model.vo.BaseVO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class CommentVO extends com.blog.shared.model.vo.BaseVO {
    private String content;

    private List<String> images;

    private Long targetId;

    private String targetType;

    private Long userId;

    private String userName;

    private String userNickname;

    private String userAvatar;

    private Long parentId;

    private Long rootId;

    private String type;

    private String nickname;

    private String email;

    private String qq;

    private Integer status;

    private Integer isVisible;

    private Integer replyCount;

    private Boolean isOwner;

    private String ip;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String device;

    private String browser;

    private List<CommentVO> replies;

    // 目标对象标题
    private String targetTitle;

    // 用于前端显示的额外属性
    @JsonProperty("authorName")
    public String getAuthorName() {
        if (userId != null && userNickname != null && !userNickname.isEmpty()) {
            return userNickname;
        }
        return nickname;
    }

    @JsonProperty("authorEmail")
    public String getAuthorEmail() {
        if (userId != null) {
            return null; // 注册用户的邮箱不暴露
        }
        return email;
    }

    @JsonProperty("authorAvatar")
    public String getAuthorAvatar() {
        return userAvatar;
    }
}

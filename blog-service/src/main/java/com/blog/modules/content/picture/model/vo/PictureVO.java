package com.blog.modules.content.picture.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class PictureVO extends com.blog.shared.model.vo.BaseVO {
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


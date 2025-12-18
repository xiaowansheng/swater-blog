package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class AlbumVO extends BaseVO {
    private String albumKey;

    private Long userId;

    private String userName;

    private String userNickname;

    private String name;

    private String description;

    private String cover;

    private String status;

    private Integer pictureCount;

    private List<PictureVO> pictures;
}


package com.blog.modules.album.model.vo;




import com.blog.modules.content.picture.model.vo.PictureVO;
import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class AlbumVO extends com.blog.common.model.vo.BaseVO {
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


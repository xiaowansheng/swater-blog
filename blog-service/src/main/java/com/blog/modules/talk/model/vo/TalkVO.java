package com.blog.modules.talk.model.vo;



import com.blog.modules.file.model.vo.FileVO;
import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class TalkVO extends com.blog.shared.model.vo.BaseVO {
    private String talkKey;

    private String content;

    private List<String> images;

    private Long authorId;

    private String authorName;

    private Integer likeCount;

    private Integer commentCount;

    private Integer viewCount;

    private String status;

    private Integer isTop;

    private String ip;

    private String ipLocation;

    private String country;

    private String province;

    private String city;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String location;

    private String device;

    private String browser;

    /**
     * 引用的文件列表
     */
    private List<FileVO> referencedFiles;
}

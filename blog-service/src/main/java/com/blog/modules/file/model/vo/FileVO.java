package com.blog.modules.file.model.vo;



import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
@Data
@EqualsAndHashCode(callSuper = true)
public class FileVO extends com.blog.common.model.vo.BaseVO {
    private String fileHash;

    private String originalName;

    private String fileType;

    private String filePath;

    private String url;

    private Long fileSize;

    private String mimeType;

    private Long uploadUserId;

    private String uploadUserName;

    private String status;

    private Integer refCount;

    private LocalDateTime expireTime;
}


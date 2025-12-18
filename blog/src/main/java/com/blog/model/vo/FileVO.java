package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class FileVO extends BaseVO {
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


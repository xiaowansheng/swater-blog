package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("file_meta")
public class FileMeta extends BaseEntity {
    @TableField("file_hash")
    private String fileHash;

    @TableField("original_name")
    private String originalName;

    @TableField("file_type")
    private String fileType;

    @TableField("file_path")
    private String filePath;

    private String url;

    @TableField("file_size")
    private Long fileSize;

    @TableField("mime_type")
    private String mimeType;

    @TableField("upload_user_id")
    private Long uploadUserId;

    private String status;

    @TableField("ref_count")
    private Integer refCount;

    @TableField("expire_time")
    private LocalDateTime expireTime;
}


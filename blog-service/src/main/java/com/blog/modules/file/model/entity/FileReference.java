package com.blog.modules.file.model.entity;


import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@TableName("file_reference")
public class FileReference {
    private Long id;

    @TableField("file_id")
    private Long fileId;

    @TableField("ref_type")
    private String refType;

    @TableField("ref_id")
    private Long refId;

    @TableField("create_time")
    private LocalDateTime createTime;
}


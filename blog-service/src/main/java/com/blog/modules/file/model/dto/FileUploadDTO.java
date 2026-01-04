package com.blog.modules.file.model.dto;


import lombok.Data;
@Data
public class FileUploadDTO {
    private String refType;

    private Long refId;

    /**
     * 业务分类，用于指定存储路径，如: article_cover, article_content, talk, avatar 等
     */
    private String category;
}


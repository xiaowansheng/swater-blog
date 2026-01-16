package com.blog.modules.talk.model.dto;

import lombok.Data;

@Data
public class TalkQueryDTO {
    private Long page;
    private Long size;
    private Long id;
    private String talkKey;
    private String status;
    private Integer isTop;
    private String keyword;
}

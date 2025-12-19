package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ArchiveVO extends BaseVO {
    private Integer year;

    private Integer month;

    private Integer postCount;
}


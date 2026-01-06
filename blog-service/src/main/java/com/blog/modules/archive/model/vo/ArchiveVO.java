package com.blog.modules.archive.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class ArchiveVO extends com.blog.shared.model.vo.BaseVO {
    private Integer year;

    private Integer month;

    private Integer postCount;

    private Integer publishedCount;

    private Integer draftCount;

    private Integer privateCount;
}


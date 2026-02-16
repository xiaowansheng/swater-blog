package com.blog.modules.tag.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class TagVO extends com.blog.shared.model.vo.BaseVO {
    private String tagKey;

    private String name;

    private String slug;

    private String color;

    private String description;

    private String status;

    private Integer articleCount;
}


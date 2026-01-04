package com.blog.modules.category.model.vo;



import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class CategoryVO extends com.blog.common.model.vo.BaseVO {
    private String categoryKey;

    private String name;

    private String slug;

    private String description;

    private Long parentId;

    private Integer sort;

    private String status;

    private List<CategoryVO> children;
}


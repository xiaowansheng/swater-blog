package com.blog.modules.category.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class CategoryVO extends com.blog.shared.model.vo.BaseVO {
    private String categoryKey;

    private String name;

    private String slug;

    private String description;

    private Long parentId;

    private Integer sort;

    private String status;

    private Integer articleCount;

    private List<CategoryVO> children;
}


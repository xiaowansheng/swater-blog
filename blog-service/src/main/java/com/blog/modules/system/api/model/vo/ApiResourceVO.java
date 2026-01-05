package com.blog.modules.system.api.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class ApiResourceVO extends com.blog.shared.model.vo.BaseVO {
    private String apiKey;

    private String name;

    private String path;

    private String method;

    private String description;

    private Long parentId;

    private Integer isOpen;

    private String perms;

    private Integer sort;
}


package com.blog.model.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class ApiVO extends BaseVO {
    private String apiKey;

    private String name;

    private String path;

    private String method;

    private String description;

    private Long parentId;

    private Integer isOpen;

    private String perms;

    private Integer sort;

    private List<ApiVO> children;
}

package com.blog.modules.system.api.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class ApiResourceDTO extends com.blog.shared.model.dto.BaseDTO {
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


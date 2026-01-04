package com.blog.modules.system.role.model.vo;



import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class RoleVO extends com.blog.common.model.vo.BaseVO {
    private String name;

    private String code;

    private String roleKey;

    private String description;

    private Integer status;

    private Integer disabled;
}


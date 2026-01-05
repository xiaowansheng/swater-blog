package com.blog.modules.system.role.model.vo;



import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
@Data
@EqualsAndHashCode(callSuper = true)
public class RoleVO extends com.blog.shared.model.vo.BaseVO {
    private String name;

    private String code;

    private String roleKey;

    private String description;

    private Integer status;

    private Integer disabled;
}


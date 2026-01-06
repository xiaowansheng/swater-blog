package com.blog.modules.system.role.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class RoleDTO extends com.blog.shared.model.dto.BaseDTO {
    @NotBlank(message = "角色名称不能为空")
    private String name;

    @NotBlank(message = "角色标签不能为空")
    private String roleKey;

    private String description;

    private Integer status;

    private Integer disabled;

    private List<Long> apiIds;
}


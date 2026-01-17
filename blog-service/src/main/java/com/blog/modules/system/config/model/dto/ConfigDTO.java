package com.blog.modules.system.config.model.dto;




import com.blog.modules.system.config.model.dto.ConfigDTO;
import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
@Data
@EqualsAndHashCode(callSuper = true)
public class ConfigDTO extends com.blog.shared.model.dto.BaseDTO {

    @NotBlank(message = "配置键不能为空")
    private String configKey;

    @NotBlank(message = "配置名称不能为空")
    private String name;

    @NotBlank(message = "配置值不能为空")
    private String value;

    private String type;

    private String description;

    private String groupName;

    private Integer sort;

    /**
     * 文件引用ID列表（前端维护，包含配置值中使用的所有文件）
     */
    private List<Long> referencedFileIds;
}


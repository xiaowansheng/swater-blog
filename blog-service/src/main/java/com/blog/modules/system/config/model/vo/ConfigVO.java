package com.blog.modules.system.config.model.vo;



import com.blog.common.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
/**
 * @author xxx
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ConfigVO extends com.blog.common.model.vo.BaseVO {
    private String configKey;

    private String name;

    private String value;

    private String type;

    private String description;

    private String groupName;

    private Integer sort;
}


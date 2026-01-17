package com.blog.modules.system.config.model.vo;



import com.blog.modules.file.model.vo.FileVO;
import com.blog.shared.model.vo.BaseVO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;
/**
 * @author xxx
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ConfigVO extends com.blog.shared.model.vo.BaseVO {
    private String configKey;

    private String name;

    private String value;

    private String type;

    private String description;

    private String groupName;

    private Integer sort;

    /**
     * 引用的文件列表
     */
    private List<FileVO> referencedFiles;
}


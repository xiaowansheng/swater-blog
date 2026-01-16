package com.blog.modules.system.log.service;



import com.blog.shared.PageResult;
import com.blog.modules.system.log.model.dto.LogErrorQueryDTO;
import com.blog.modules.system.log.model.entity.LogError;
import com.blog.modules.system.log.model.vo.LogErrorVO;
public interface LogErrorService {
    PageResult<LogErrorVO> list(LogErrorQueryDTO queryDTO);

    LogErrorVO getById(Long id);

    void delete(Long id);

    void cleanup(Integer retentionDays);

    /**
     * 保存异常日志
     */
    void save(LogError logError);
}


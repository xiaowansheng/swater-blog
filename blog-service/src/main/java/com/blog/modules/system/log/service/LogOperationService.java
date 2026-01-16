package com.blog.modules.system.log.service;



import com.blog.shared.PageResult;
import com.blog.modules.system.log.model.dto.LogOperationQueryDTO;
import com.blog.modules.system.log.model.entity.LogOperation;
import com.blog.modules.system.log.model.vo.LogOperationVO;
public interface LogOperationService {
    PageResult<LogOperationVO> list(LogOperationQueryDTO queryDTO);

    LogOperationVO getById(Long id);

    void delete(Long id);

    void cleanup(Integer retentionDays);

    /**
     * 保存操作日志
     */
    void save(LogOperation logOperation);
}


package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.entity.LogOperation;
import com.blog.model.vo.LogOperationVO;

import java.time.LocalDateTime;

public interface LogOperationService {
    PageResult<LogOperationVO> list(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate);

    LogOperationVO getById(Long id);

    void delete(Long id);

    void cleanup(Integer retentionDays);

    /**
     * 保存操作日志
     */
    void save(LogOperation logOperation);
}


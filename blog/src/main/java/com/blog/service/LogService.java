package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.ExceptionLogVO;
import com.blog.model.vo.OperationLogVO;

import java.time.LocalDateTime;

public interface LogService {
    PageResult<OperationLogVO> getOperationLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate);

    PageResult<ExceptionLogVO> getExceptionLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate);

    void deleteOperationLog(Long id);

    void deleteExceptionLog(Long id);

    void cleanupExpiredLogs(Integer retentionDays);
}


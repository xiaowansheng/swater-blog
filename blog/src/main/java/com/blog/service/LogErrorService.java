package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.LogErrorVO;

import java.time.LocalDateTime;

public interface LogErrorService {
    PageResult<LogErrorVO> list(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate);

    LogErrorVO getById(Long id);

    void delete(Long id);

    void cleanup(Integer retentionDays);
}


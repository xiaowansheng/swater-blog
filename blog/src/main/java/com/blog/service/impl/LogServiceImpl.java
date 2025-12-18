package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.LogErrorMapper;
import com.blog.mapper.LogOperationMapper;
import com.blog.model.entity.LogError;
import com.blog.model.entity.LogOperation;
import com.blog.model.vo.ExceptionLogVO;
import com.blog.model.vo.OperationLogVO;
import com.blog.service.LogService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LogServiceImpl implements LogService {
    @Autowired
    private LogOperationMapper logOperationMapper;

    @Autowired
    private LogErrorMapper logErrorMapper;

    @Override
    public PageResult<OperationLogVO> getOperationLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Page<LogOperation> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<LogOperation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LogOperation::getDeleted, 0);
        
        if (userId != null) {
            wrapper.eq(LogOperation::getUserId, userId);
        }
        if (startDate != null) {
            wrapper.ge(LogOperation::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(LogOperation::getCreateTime, endDate);
        }
        wrapper.orderByDesc(LogOperation::getCreateTime);
        
        Page<LogOperation> result = logOperationMapper.selectPage(pageParam, wrapper);
        List<OperationLogVO> voList = result.getRecords().stream()
                .map(log -> BeanUtil.copyProperties(log, OperationLogVO.class))
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public PageResult<ExceptionLogVO> getExceptionLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Page<LogError> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<LogError> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LogError::getDeleted, 0);
        
        if (userId != null) {
            wrapper.eq(LogError::getUserId, userId);
        }
        if (startDate != null) {
            wrapper.ge(LogError::getCreateTime, startDate);
        }
        if (endDate != null) {
            wrapper.le(LogError::getCreateTime, endDate);
        }
        wrapper.orderByDesc(LogError::getCreateTime);
        
        Page<LogError> result = logErrorMapper.selectPage(pageParam, wrapper);
        List<ExceptionLogVO> voList = result.getRecords().stream()
                .map(log -> BeanUtil.copyProperties(log, ExceptionLogVO.class))
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    @Transactional
    public void deleteOperationLog(Long id) {
        logOperationMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteExceptionLog(Long id) {
        logErrorMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void cleanupExpiredLogs(Integer retentionDays) {
        LocalDateTime expireDate = LocalDateTime.now().minusDays(retentionDays != null ? retentionDays : 90);
        
        LambdaQueryWrapper<LogOperation> operationWrapper = new LambdaQueryWrapper<>();
        operationWrapper.eq(LogOperation::getDeleted, 0);
        operationWrapper.lt(LogOperation::getCreateTime, expireDate);
        logOperationMapper.delete(operationWrapper);
        
        LambdaQueryWrapper<LogError> errorWrapper = new LambdaQueryWrapper<>();
        errorWrapper.eq(LogError::getDeleted, 0);
        errorWrapper.lt(LogError::getCreateTime, expireDate);
        logErrorMapper.delete(errorWrapper);
    }
}


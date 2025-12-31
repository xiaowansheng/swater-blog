package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.LogErrorMapper;
import com.blog.model.entity.LogError;
import com.blog.model.vo.LogErrorVO;
import com.blog.service.LogErrorService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LogErrorServiceImpl implements LogErrorService {
    @Autowired
    private LogErrorMapper logErrorMapper;

    @Override
    public PageResult<LogErrorVO> list(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Page<LogError> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<LogError> wrapper = new LambdaQueryWrapper<>();

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
        List<LogErrorVO> voList = result.getRecords().stream()
                .map(log -> BeanUtil.copyProperties(log, LogErrorVO.class))
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public LogErrorVO getById(Long id) {
        LogError log = logErrorMapper.selectById(id);
        if (log == null) {
            return null;
        }
        return BeanUtil.copyProperties(log, LogErrorVO.class);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        LogError log = logErrorMapper.selectById(id);
        if (log == null) {
            return;
        }
        logErrorMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void cleanup(Integer retentionDays) {
        if (retentionDays == null || retentionDays <= 0) {
            retentionDays = 90;
        }
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        logErrorMapper.deleteByCreateTimeBefore(cutoffDate);
    }
}


package com.blog.core.plugin.log.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.modules.system.log.mapper.LogErrorMapper;
import com.blog.modules.system.log.mapper.LogOperationMapper;
import com.blog.modules.system.log.model.entity.LogError;
import com.blog.modules.system.log.model.entity.LogOperation;
import com.blog.modules.system.log.model.vo.LogErrorVO;
import com.blog.modules.system.log.model.vo.LogOperationVO;
import com.blog.core.plugin.core.Plugin;
import com.blog.core.plugin.log.LogStoragePlugin;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Component
@ConditionalOnProperty(name = "log.storage.type", havingValue = "mysql", matchIfMissing = true)
public class MySQLLogStoragePlugin implements LogStoragePlugin, Plugin {
    
    @Autowired
    private LogOperationMapper logOperationMapper;
    
    @Autowired
    private LogErrorMapper logErrorMapper;
    
    @Override
    public String getName() {
        return "mysql";
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    @Override
    @Transactional
    public void saveOperationLog(LogOperationVO logOperation) throws Exception {
        LogOperation entity = BeanUtil.copyProperties(logOperation, LogOperation.class);
        logOperationMapper.insert(entity);
    }
    
    @Override
    @Transactional
    public void saveErrorLog(LogErrorVO logError) throws Exception {
        LogError entity = BeanUtil.copyProperties(logError, LogError.class);
        logErrorMapper.insert(entity);
    }
    
    @Override
    public PageResult<LogOperationVO> queryOperationLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) throws Exception {
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
        List<LogOperationVO> voList = result.getRecords().stream()
                .map(log -> BeanUtil.copyProperties(log, LogOperationVO.class))
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }
    
    @Override
    public PageResult<LogErrorVO> queryErrorLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) throws Exception {
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
        List<LogErrorVO> voList = result.getRecords().stream()
                .map(log -> BeanUtil.copyProperties(log, LogErrorVO.class))
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }
    
    @Override
    public LogOperationVO getOperationLogById(Long id) throws Exception {
        LogOperation log = logOperationMapper.selectById(id);
        if (log == null || log.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(log, LogOperationVO.class);
    }
    
    @Override
    public LogErrorVO getErrorLogById(Long id) throws Exception {
        LogError log = logErrorMapper.selectById(id);
        if (log == null || log.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(log, LogErrorVO.class);
    }
    
    @Override
    @Transactional
    public void deleteOperationLog(Long id) throws Exception {
        LogOperation log = logOperationMapper.selectById(id);
        if (log == null || log.getDeleted() == 1) {
            return;
        }
        logOperationMapper.deleteById(id);
    }
    
    @Override
    @Transactional
    public void deleteErrorLog(Long id) throws Exception {
        LogError log = logErrorMapper.selectById(id);
        if (log == null || log.getDeleted() == 1) {
            return;
        }
        logErrorMapper.deleteById(id);
    }
    
    @Override
    @Transactional
    public void cleanupLogs(Integer retentionDays) throws Exception {
        if (retentionDays == null || retentionDays <= 0) {
            retentionDays = 90;
        }
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        logOperationMapper.deleteByCreateTimeBefore(cutoffDate);
        logErrorMapper.deleteByCreateTimeBefore(cutoffDate);
    }
}


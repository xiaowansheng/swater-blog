package com.blog.modules.system.log.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.modules.system.log.mapper.LogOperationMapper;
import com.blog.modules.system.log.model.entity.LogOperation;
import com.blog.modules.system.log.model.vo.LogOperationVO;
import com.blog.modules.system.log.service.LogOperationService;
import com.blog.common.util.BeanUtil;
import com.blog.common.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class LogOperationServiceImpl implements LogOperationService {
    @Autowired
    private LogOperationMapper logOperationMapper;

    @Override
    public PageResult<LogOperationVO> list(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Page<LogOperation> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<LogOperation> wrapper = new LambdaQueryWrapper<>();

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
    public LogOperationVO getById(Long id) {
        LogOperation log = logOperationMapper.selectById(id);
        if (log == null) {
            return null;
        }
        return BeanUtil.copyProperties(log, LogOperationVO.class);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        LogOperation log = logOperationMapper.selectById(id);
        if (log == null) {
            return;
        }
        logOperationMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void cleanup(Integer retentionDays) {
        if (retentionDays == null || retentionDays <= 0) {
            retentionDays = 90;
        }
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        logOperationMapper.deleteByCreateTimeBefore(cutoffDate);
    }

    @Override
    @Transactional
    public void save(LogOperation logOperation) {
        if (logOperation != null) {
            logOperationMapper.insert(logOperation);
        }
    }
}


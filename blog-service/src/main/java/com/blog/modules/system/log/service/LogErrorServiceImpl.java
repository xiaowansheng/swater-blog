package com.blog.modules.system.log.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.system.log.mapper.LogErrorMapper;
import com.blog.modules.system.log.model.dto.LogErrorQueryDTO;
import com.blog.modules.system.log.model.entity.LogError;
import com.blog.modules.system.log.model.vo.LogErrorVO;
import com.blog.modules.system.log.service.LogErrorService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
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
    public PageResult<LogErrorVO> list(LogErrorQueryDTO queryDTO) {
        Page<LogError> pageParam = PageUtil.buildPage(queryDTO.getPage(), queryDTO.getSize());
        LambdaQueryWrapper<LogError> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getUserId() != null) {
            wrapper.eq(LogError::getUserId, queryDTO.getUserId());
        }
        if (queryDTO.getModule() != null && !queryDTO.getModule().trim().isEmpty()) {
            wrapper.eq(LogError::getModule, queryDTO.getModule().trim());
        }
        if (queryDTO.getRequestMethod() != null && !queryDTO.getRequestMethod().trim().isEmpty()) {
            wrapper.eq(LogError::getRequestMethod, queryDTO.getRequestMethod().trim());
        }
        if (queryDTO.getRequestUri() != null && !queryDTO.getRequestUri().trim().isEmpty()) {
            wrapper.like(LogError::getRequestUri, queryDTO.getRequestUri().trim());
        }
        if (queryDTO.getUsername() != null && !queryDTO.getUsername().trim().isEmpty()) {
            wrapper.like(LogError::getUsername, queryDTO.getUsername().trim());
        }
        if (queryDTO.getIp() != null && !queryDTO.getIp().trim().isEmpty()) {
            wrapper.eq(LogError::getIp, queryDTO.getIp().trim());
        }
        if (queryDTO.getErrorName() != null && !queryDTO.getErrorName().trim().isEmpty()) {
            wrapper.like(LogError::getErrorName, queryDTO.getErrorName().trim());
        }
        if (queryDTO.getExceptionType() != null && !queryDTO.getExceptionType().trim().isEmpty()) {
            wrapper.like(LogError::getExceptionType, queryDTO.getExceptionType().trim());
        }
        if (queryDTO.getDevice() != null && !queryDTO.getDevice().trim().isEmpty()) {
            wrapper.like(LogError::getDevice, queryDTO.getDevice().trim());
        }
        if (queryDTO.getBrowser() != null && !queryDTO.getBrowser().trim().isEmpty()) {
            wrapper.like(LogError::getBrowser, queryDTO.getBrowser().trim());
        }
        if (queryDTO.getIpSource() != null && !queryDTO.getIpSource().trim().isEmpty()) {
            wrapper.like(LogError::getIpSource, queryDTO.getIpSource().trim());
        }
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().trim().isEmpty()) {
            String keyword = queryDTO.getKeyword().trim();
            wrapper.and(w -> w.like(LogError::getErrorMessage, keyword)
                    .or()
                    .like(LogError::getErrorName, keyword)
                    .or()
                    .like(LogError::getExceptionType, keyword)
                    .or()
                    .like(LogError::getRequestUri, keyword));
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(LogError::getCreateTime, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(LogError::getCreateTime, queryDTO.getEndDate());
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

    @Override
    @Transactional
    public void save(LogError logError) {
        if (logError != null) {
            logErrorMapper.insert(logError);
        }
    }
}

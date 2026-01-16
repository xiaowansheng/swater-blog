package com.blog.modules.system.log.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.system.log.mapper.LogOperationMapper;
import com.blog.modules.system.log.model.dto.LogOperationQueryDTO;
import com.blog.modules.system.log.model.entity.LogOperation;
import com.blog.modules.system.log.model.vo.LogOperationVO;
import com.blog.modules.system.log.service.LogOperationService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
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
    public PageResult<LogOperationVO> list(LogOperationQueryDTO queryDTO) {
        Page<LogOperation> pageParam = PageUtil.buildPage(queryDTO.getPage(), queryDTO.getSize());
        LambdaQueryWrapper<LogOperation> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getUserId() != null) {
            wrapper.eq(LogOperation::getUserId, queryDTO.getUserId());
        }
        if (queryDTO.getModule() != null && !queryDTO.getModule().trim().isEmpty()) {
            wrapper.eq(LogOperation::getModule, queryDTO.getModule().trim());
        }
        if (queryDTO.getType() != null && !queryDTO.getType().trim().isEmpty()) {
            wrapper.eq(LogOperation::getType, queryDTO.getType().trim());
        }
        if (queryDTO.getRequestMethod() != null && !queryDTO.getRequestMethod().trim().isEmpty()) {
            wrapper.eq(LogOperation::getRequestMethod, queryDTO.getRequestMethod().trim());
        }
        if (queryDTO.getRequestUri() != null && !queryDTO.getRequestUri().trim().isEmpty()) {
            wrapper.like(LogOperation::getRequestUri, queryDTO.getRequestUri().trim());
        }
        if (queryDTO.getUsername() != null && !queryDTO.getUsername().trim().isEmpty()) {
            wrapper.like(LogOperation::getUsername, queryDTO.getUsername().trim());
        }
        if (queryDTO.getIp() != null && !queryDTO.getIp().trim().isEmpty()) {
            wrapper.eq(LogOperation::getIp, queryDTO.getIp().trim());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(LogOperation::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getDevice() != null && !queryDTO.getDevice().trim().isEmpty()) {
            wrapper.like(LogOperation::getDevice, queryDTO.getDevice().trim());
        }
        if (queryDTO.getBrowser() != null && !queryDTO.getBrowser().trim().isEmpty()) {
            wrapper.like(LogOperation::getBrowser, queryDTO.getBrowser().trim());
        }
        if (queryDTO.getIpSource() != null && !queryDTO.getIpSource().trim().isEmpty()) {
            wrapper.like(LogOperation::getIpSource, queryDTO.getIpSource().trim());
        }
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().trim().isEmpty()) {
            String keyword = queryDTO.getKeyword().trim();
            wrapper.and(w -> w.like(LogOperation::getOperation, keyword)
                    .or()
                    .like(LogOperation::getDescription, keyword)
                    .or()
                    .like(LogOperation::getRequestUri, keyword));
        }
        if (queryDTO.getStartDate() != null) {
            wrapper.ge(LogOperation::getCreateTime, queryDTO.getStartDate());
        }
        if (queryDTO.getEndDate() != null) {
            wrapper.le(LogOperation::getCreateTime, queryDTO.getEndDate());
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

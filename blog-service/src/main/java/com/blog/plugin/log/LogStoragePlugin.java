package com.blog.plugin.log;

import com.blog.common.PageResult;
import com.blog.model.vo.LogErrorVO;
import com.blog.model.vo.LogOperationVO;

import java.time.LocalDateTime;

/**
 * 日志存储插件接口
 */
public interface LogStoragePlugin {
    /**
     * 保存操作日志
     * @param logOperation 操作日志数据
     */
    void saveOperationLog(LogOperationVO logOperation) throws Exception;
    
    /**
     * 保存异常日志
     * @param logError 异常日志数据
     */
    void saveErrorLog(LogErrorVO logError) throws Exception;
    
    /**
     * 查询操作日志
     * @param page 页码
     * @param size 每页大小
     * @param userId 用户ID（可选）
     * @param startDate 开始时间（可选）
     * @param endDate 结束时间（可选）
     * @return 操作日志列表
     */
    PageResult<LogOperationVO> queryOperationLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) throws Exception;
    
    /**
     * 查询异常日志
     * @param page 页码
     * @param size 每页大小
     * @param userId 用户ID（可选）
     * @param startDate 开始时间（可选）
     * @param endDate 结束时间（可选）
     * @return 异常日志列表
     */
    PageResult<LogErrorVO> queryErrorLogs(Long page, Long size, Long userId, LocalDateTime startDate, LocalDateTime endDate) throws Exception;
    
    /**
     * 根据ID获取操作日志
     * @param id 日志ID
     * @return 操作日志
     */
    LogOperationVO getOperationLogById(Long id) throws Exception;
    
    /**
     * 根据ID获取异常日志
     * @param id 日志ID
     * @return 异常日志
     */
    LogErrorVO getErrorLogById(Long id) throws Exception;
    
    /**
     * 删除操作日志
     * @param id 日志ID
     */
    void deleteOperationLog(Long id) throws Exception;
    
    /**
     * 删除异常日志
     * @param id 日志ID
     */
    void deleteErrorLog(Long id) throws Exception;
    
    /**
     * 清理过期日志
     * @param retentionDays 保留天数
     */
    void cleanupLogs(Integer retentionDays) throws Exception;
}


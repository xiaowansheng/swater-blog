package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.ExceptionLogVO;
import com.blog.model.vo.OperationLogVO;
import com.blog.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/log")
@ApiResource(name = "日志管理接口")
public class LogController {
    @Autowired
    private LogService logService;

    @GetMapping("/operation/list")
    public Result<PageResult<OperationLogVO>> getOperationLogs(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PageResult<OperationLogVO> result = logService.getOperationLogs(page, size, userId, startDate, endDate);
        return Result.success(result);
    }

    @GetMapping("/exception/list")
    public Result<PageResult<ExceptionLogVO>> getExceptionLogs(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PageResult<ExceptionLogVO> result = logService.getExceptionLogs(page, size, userId, startDate, endDate);
        return Result.success(result);
    }

    @DeleteMapping("/operation/{id}")
    public Result<Void> deleteOperationLog(@PathVariable Long id) {
        logService.deleteOperationLog(id);
        return Result.success();
    }

    @DeleteMapping("/exception/{id}")
    public Result<Void> deleteExceptionLog(@PathVariable Long id) {
        logService.deleteExceptionLog(id);
        return Result.success();
    }

    @PostMapping("/cleanup")
    public Result<Void> cleanupExpiredLogs(@RequestParam(required = false) Integer retentionDays) {
        logService.cleanupExpiredLogs(retentionDays);
        return Result.success();
    }
}


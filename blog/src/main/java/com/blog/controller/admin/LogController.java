package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.LogErrorVO;
import com.blog.model.vo.LogOperationVO;
import com.blog.service.LogErrorService;
import com.blog.service.LogOperationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/log")
@ApiResource(name = "日志管理接口")
public class LogController {
    @Autowired
    private LogOperationService logOperationService;

    @Autowired
    private LogErrorService logErrorService;

    @GetMapping("/operation/list")
    public Result<PageResult<LogOperationVO>> getOperationLogList(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PageResult<LogOperationVO> result = logOperationService.list(page, size, userId, startDate, endDate);
        return Result.success(result);
    }

    @GetMapping("/operation/{id}")
    public Result<LogOperationVO> getOperationLogById(@PathVariable Long id) {
        LogOperationVO vo = logOperationService.getById(id);
        if (vo == null) {
            return Result.error(404, "操作日志不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/exception/list")
    public Result<PageResult<LogErrorVO>> getExceptionLogList(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PageResult<LogErrorVO> result = logErrorService.list(page, size, userId, startDate, endDate);
        return Result.success(result);
    }

    @GetMapping("/exception/{id}")
    public Result<LogErrorVO> getExceptionLogById(@PathVariable Long id) {
        LogErrorVO vo = logErrorService.getById(id);
        if (vo == null) {
            return Result.error(404, "异常日志不存在");
        }
        return Result.success(vo);
    }

    @DeleteMapping("/operation/{id}")
    public Result<Void> deleteOperationLog(@PathVariable Long id) {
        logOperationService.delete(id);
        return Result.success();
    }

    @DeleteMapping("/exception/{id}")
    public Result<Void> deleteExceptionLog(@PathVariable Long id) {
        logErrorService.delete(id);
        return Result.success();
    }

    @PostMapping("/cleanup")
    public Result<Void> cleanup(@RequestParam(required = false) Integer retentionDays) {
        logOperationService.cleanup(retentionDays);
        logErrorService.cleanup(retentionDays);
        return Result.success();
    }
}


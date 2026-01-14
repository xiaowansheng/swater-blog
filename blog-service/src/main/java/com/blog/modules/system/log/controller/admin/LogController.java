package com.blog.modules.system.log.controller.admin;



import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.system.log.model.vo.LogErrorVO;
import com.blog.modules.system.log.model.vo.LogOperationVO;
import com.blog.modules.system.log.service.LogErrorService;
import com.blog.modules.system.log.service.LogOperationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
@RestController
@RequestMapping("/admin/log")
@ApiOperation(name = "日志管理模块", description = "日志管理接口", open = false)
public class LogController {
    @Autowired
    private LogOperationService logOperationService;

    @Autowired
    private LogErrorService logErrorService;

    @GetMapping("/operation/list")
    @ApiOperation(name = "查询操作日志列表", type = ApiOperationType.QUERY, description = "分页查询操作日志")
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
    @ApiOperation(name = "获取操作日志详情", type = ApiOperationType.QUERY, description = "根据ID获取操作日志详情")
    public Result<LogOperationVO> getOperationLogById(@PathVariable Long id) {
        LogOperationVO vo = logOperationService.getById(id);
        if (vo == null) {
            return Result.error(404, "操作日志不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/exception/list")
    @ApiOperation(name = "查询异常日志列表", type = ApiOperationType.QUERY, description = "分页查询异常日志")
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
    @ApiOperation(name = "获取异常日志详情", type = ApiOperationType.QUERY, description = "根据ID获取异常日志详情")
    public Result<LogErrorVO> getExceptionLogById(@PathVariable Long id) {
        LogErrorVO vo = logErrorService.getById(id);
        if (vo == null) {
            return Result.error(404, "异常日志不存在");
        }
        return Result.success(vo);
    }

    @DeleteMapping("/operation/{id}")
    @ApiOperation(name = "删除操作日志", type = ApiOperationType.DELETE, description = "删除操作日志")
    public Result<Void> deleteOperationLog(@PathVariable Long id) {
        logOperationService.delete(id);
        return Result.success();
    }

    @DeleteMapping("/exception/{id}")
    @ApiOperation(name = "删除异常日志", type = ApiOperationType.DELETE, description = "删除异常日志")
    public Result<Void> deleteExceptionLog(@PathVariable Long id) {
        logErrorService.delete(id);
        return Result.success();
    }

    @PostMapping("/cleanup")
    @ApiOperation(name = "清理日志", type = ApiOperationType.OTHER, description = "清理过期日志")
    public Result<Void> cleanup(@RequestParam(required = false) Integer retentionDays) {
        logOperationService.cleanup(retentionDays);
        logErrorService.cleanup(retentionDays);
        return Result.success();
    }
}

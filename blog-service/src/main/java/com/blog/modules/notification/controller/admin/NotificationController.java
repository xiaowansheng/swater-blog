package com.blog.modules.notification.controller.admin;


import com.blog.common.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.common.Result;
import com.blog.common.PageResult;
import com.blog.modules.notification.model.dto.NotificationDTO;
import com.blog.modules.notification.model.vo.NotificationVO;
import com.blog.modules.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/notification")
@ApiOperation(name = "通知管理模块", description = "通知管理接口", open = false)
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @PostMapping
    @ApiOperation(name = "创建通知", type = ApiOperationType.CREATE, description = "创建新通知")
    public Result<Long> create(@RequestBody NotificationDTO dto) {
        Long id = notificationService.create(dto);
        return Result.success(id);
    }

    @GetMapping
    @ApiOperation(name = "查询通知列表", type = ApiOperationType.QUERY, description = "分页查询通知列表")
    public Result<PageResult<NotificationVO>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Integer isRead) {
        PageResult<NotificationVO> result = notificationService.list(userId, page, size, isRead);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取通知详情", type = ApiOperationType.QUERY, description = "根据ID获取通知详情")
    public Result<NotificationVO> getById(@PathVariable Long id) {
        NotificationVO vo = notificationService.getById(id);
        return Result.success(vo);
    }

    @PutMapping("/{id}/read")
    @ApiOperation(name = "标记通知为已读", type = ApiOperationType.UPDATE, description = "标记通知为已读")
    public Result<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return Result.success();
    }

    @PutMapping("/read-all")
    @ApiOperation(name = "标记所有通知为已读", type = ApiOperationType.UPDATE, description = "标记用户的所有通知为已读")
    public Result<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除通知", type = ApiOperationType.DELETE, description = "删除通知")
    public Result<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return Result.success();
    }
}

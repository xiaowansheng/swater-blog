package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.common.PageResult;
import com.blog.model.dto.NotificationDTO;
import com.blog.model.vo.NotificationVO;
import com.blog.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notification")
@ApiResource(name = "通知管理接口")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public Result<Long> create(@RequestBody NotificationDTO dto) {
        Long id = notificationService.create(dto);
        return Result.success(id);
    }

    @GetMapping
    public Result<PageResult<NotificationVO>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Integer isRead) {
        PageResult<NotificationVO> result = notificationService.list(userId, page, size, isRead);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<NotificationVO> getById(@PathVariable Long id) {
        NotificationVO vo = notificationService.getById(id);
        return Result.success(vo);
    }

    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return Result.success();
    }

    @PutMapping("/read-all")
    public Result<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return Result.success();
    }
}


package com.blog.modules.notification.service;


import com.blog.shared.PageResult;
import com.blog.modules.notification.model.dto.NotificationDTO;
import com.blog.modules.notification.model.vo.NotificationVO;
public interface NotificationService {
    Long create(NotificationDTO dto);

    /**
     * 分页查询通知列表。
     *
     * @param userId    目标用户 ID（仅 admin 可查询任意用户，非 admin 将被强制覆盖为 currentUserId）
     * @param isAdmin   当前请求者是否为管理员
     * @param currentUserId 当前登录用户 ID
     */
    PageResult<NotificationVO> list(Long userId, boolean isAdmin, Long currentUserId, Long page, Long size, Integer isRead);

    /**
     * 获取通知详情。非 admin 仅能查询自己的通知，否则抛 403。
     */
    NotificationVO getById(Long id, Long currentUserId, boolean isAdmin);

    /**
     * 标记通知为已读。非 admin 仅能操作自己的通知，否则抛 403。
     */
    void markAsRead(Long id, Long currentUserId, boolean isAdmin);

    void markAllAsRead(Long userId);

    /**
     * 删除通知。非 admin 仅能删除自己的通知，否则抛 403。
     */
    void delete(Long id, Long currentUserId, boolean isAdmin);

    void sendNotification(Long userId, String type, String title, String content);

    /**
     * 重试通知发送。非 admin 仅能重试自己的通知，否则抛 403。
     */
    void retryNotification(Long id, Long currentUserId, boolean isAdmin);

    /**
     * 批量重试通知发送。非 admin 仅能重试自己的通知，越权条目会被跳过并记录日志。
     */
    void retryNotifications(java.util.List<Long> ids, Long currentUserId, boolean isAdmin);

    void retryFailedNotifications();
}

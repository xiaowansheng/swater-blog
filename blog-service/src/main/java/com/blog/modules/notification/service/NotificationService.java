package com.blog.modules.notification.service;


import com.blog.shared.PageResult;
import com.blog.modules.notification.model.dto.NotificationDTO;
import com.blog.modules.notification.model.vo.NotificationVO;
public interface NotificationService {
    Long create(NotificationDTO dto);

    PageResult<NotificationVO> list(Long userId, Long page, Long size, Integer isRead);

    NotificationVO getById(Long id);

    void markAsRead(Long id);

    void markAllAsRead(Long userId);

    void delete(Long id);

    void sendNotification(Long userId, String type, String title, String content);

    void retryNotification(Long id);

    void retryNotifications(java.util.List<Long> ids);

    void retryFailedNotifications();
}

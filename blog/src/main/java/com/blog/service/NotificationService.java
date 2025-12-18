package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.dto.NotificationDTO;
import com.blog.model.vo.NotificationVO;

public interface NotificationService {
    Long create(NotificationDTO dto);

    PageResult<NotificationVO> list(Long userId, Long page, Long size, Integer isRead);

    NotificationVO getById(Long id);

    void markAsRead(Long id);

    void markAllAsRead(Long userId);

    void delete(Long id);

    void sendNotification(Long userId, String type, String title, String content);
}


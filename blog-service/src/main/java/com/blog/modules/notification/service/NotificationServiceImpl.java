package com.blog.modules.notification.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.notification.mapper.SysNotificationMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.infrastructure.mq.MQService;
import com.blog.modules.notification.model.dto.NotificationDTO;
import com.blog.modules.notification.model.entity.SysNotification;
import com.blog.modules.notification.model.enums.NotificationSendStatus;
import com.blog.modules.notification.model.message.NotificationMessage;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.notification.model.vo.NotificationVO;
import com.blog.modules.notification.service.NotificationService;
import com.blog.plugin.components.notification.NotificationChannelFactory;
import com.blog.plugin.components.notification.NotificationChannelPlugin;
import com.blog.shared.model.enums.ReadStatus;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.EventUtil;
import com.blog.shared.util.PageUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {
    @Autowired
    private SysNotificationMapper sysNotificationMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired(required = false)
    private NotificationChannelFactory notificationChannelFactory;

    @Autowired
    private MQService mqService;

    @Override
    @Transactional
    public Long create(NotificationDTO dto) {
        SysNotification notification = BeanUtil.copyProperties(dto, SysNotification.class);
        notification.setStatus(NotificationSendStatus.PENDING.getCode());
        notification.setIsRead(ReadStatus.UNREAD.getCode());
        notification.setSendCount(0);
        notification.setMaxRetryCount(3);
        if (notification.getPriority() == null) {
            notification.setPriority(5);
        }
        if (notification.getImmediate() == null) {
            notification.setImmediate(0);
        }
        sysNotificationMapper.insert(notification);
        return notification.getId();
    }

    @Override
    public PageResult<NotificationVO> list(Long userId, Long page, Long size, Integer isRead) {
        Page<SysNotification> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<SysNotification> wrapper = new LambdaQueryWrapper<>();

        if (userId != null) {
            wrapper.eq(SysNotification::getUserId, userId);
        }
        if (isRead != null) {
            wrapper.eq(SysNotification::getIsRead, isRead);
        }
        wrapper.orderByDesc(SysNotification::getCreateTime);
        
        Page<SysNotification> result = sysNotificationMapper.selectPage(pageParam, wrapper);
        List<NotificationVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        
        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public NotificationVO getById(Long id) {
        SysNotification notification = sysNotificationMapper.selectById(id);
        if (notification == null) {
            return null;
        }
        return convertToVO(notification);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        SysNotification notification = sysNotificationMapper.selectById(id);
        if (notification == null) {
            return;
        }
        notification.setIsRead(ReadStatus.READ.getCode());
        sysNotificationMapper.updateById(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        LambdaUpdateWrapper<SysNotification> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(SysNotification::getUserId, userId)
                .eq(SysNotification::getIsRead, ReadStatus.UNREAD.getCode())
                .set(SysNotification::getIsRead, ReadStatus.READ.getCode());
        sysNotificationMapper.update(null, wrapper);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        SysNotification notification = sysNotificationMapper.selectById(id);
        if (notification == null) {
            return;
        }
        sysNotificationMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void sendNotification(Long userId, String type, String title, String content) {
        NotificationDTO dto = new NotificationDTO();
        dto.setUserId(userId);
        dto.setType(type);
        dto.setTitle(title);
        dto.setContent(content);
        dto.setImmediate(1);
        
        Long notificationId = create(dto);
        
        SysNotification notification = sysNotificationMapper.selectById(notificationId);
        EventUtil.publishEventAfterCommit(() -> {
            NotificationMessage message = new NotificationMessage();
            message.setNotificationId(notificationId);
            message.setUserId(userId);
            message.setType(type);
            message.setTitle(title);
            message.setContent(content);
            message.setTimestamp(LocalDateTime.now());
            message.setData(Map.of());

            if (!enqueueMessage(notification, message)) {
                log.warn("通知消息入队失败，notificationId: {}", notificationId);
            }
        });
    }

    @Transactional
    public void processNotificationMessage(NotificationMessage message) {
        if (message == null || message.getNotificationId() == null) {
            log.warn("通知消息为空或缺少ID，跳过处理");
            return;
        }

        SysNotification notification = sysNotificationMapper.selectById(message.getNotificationId());
        if (notification == null) {
            log.warn("未找到通知记录，notificationId: {}", message.getNotificationId());
            return;
        }

        try {
            dispatchChannels(message.getUserId(), message.getType(), message.getTitle(), message.getContent());

            notification.setStatus(NotificationSendStatus.SENT.getCode());
            notification.setIsRead(ReadStatus.UNREAD.getCode());
            notification.setSentTime(LocalDateTime.now());
            notification.setSendCount(notification.getSendCount() == null ? 1 : notification.getSendCount() + 1);
            notification.setNextRetryTime(null);
            sysNotificationMapper.updateById(notification);
        } catch (Exception e) {
            int sendCount = notification.getSendCount() == null ? 0 : notification.getSendCount();
            notification.setSendCount(sendCount + 1);
            notification.setStatus(NotificationSendStatus.FAILED.getCode());
            notification.setNextRetryTime(nextRetryTime(notification));
            sysNotificationMapper.updateById(notification);
            log.error("通知消息处理失败，notificationId: {}", message.getNotificationId(), e);
        }
    }

    @Override
    @Transactional
    public void retryNotification(Long id) {
        SysNotification notification = sysNotificationMapper.selectById(id);
        if (notification == null) {
            return;
        }
        if (NotificationSendStatus.SENT.matches(notification.getStatus())) {
            return;
        }
        EventUtil.publishEventAfterCommit(() -> {
            NotificationMessage message = buildMessage(notification);
            if (!enqueueMessage(notification, message)) {
                log.warn("通知重试入队失败，notificationId: {}", id);
            }
        });
    }

    @Override
    @Transactional
    public void retryNotifications(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }

        List<Long> validIds = ids.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (validIds.isEmpty()) {
            return;
        }

        List<SysNotification> notifications = sysNotificationMapper.selectBatchIds(validIds);
        for (SysNotification notification : notifications) {
            if (notification == null || NotificationSendStatus.SENT.matches(notification.getStatus())) {
                continue;
            }
            EventUtil.publishEventAfterCommit(() -> {
                NotificationMessage message = buildMessage(notification);
                if (!enqueueMessage(notification, message)) {
                    log.warn("通知重试入队失败，notificationId: {}", notification.getId());
                }
            });
        }
    }

    @Override
    @Transactional
    public void retryFailedNotifications() {
        LocalDateTime now = LocalDateTime.now();
        LambdaQueryWrapper<SysNotification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysNotification::getStatus, NotificationSendStatus.FAILED.getCode())
                .and(w -> w.isNull(SysNotification::getNextRetryTime).or().le(SysNotification::getNextRetryTime, now))
                .orderByAsc(SysNotification::getNextRetryTime);

        List<SysNotification> notifications = sysNotificationMapper.selectList(wrapper);
        for (SysNotification notification : notifications) {
            if (!shouldRetry(notification)) {
                continue;
            }
            EventUtil.publishEventAfterCommit(() -> {
                NotificationMessage message = buildMessage(notification);
                if (!enqueueMessage(notification, message)) {
                    log.warn("通知重试入队失败，notificationId: {}", notification.getId());
                }
            });
        }
    }

    private void dispatchChannels(Long userId, String type, String title, String content) {
        if (notificationChannelFactory == null) {
            log.warn("通知渠道插件工厂未配置，跳过发送");
            return;
        }
        List<NotificationChannelPlugin> channels = notificationChannelFactory.getEnabledChannels();
        if (channels == null || channels.isEmpty()) {
            log.warn("未找到可用的通知渠道插件");
            return;
        }
        for (NotificationChannelPlugin channel : channels) {
            try {
                channel.send(userId, type, title, content);
            } catch (Exception e) {
                log.error("通知渠道 {} 发送失败", channel.getId(), e);
            }
        }
    }

    private NotificationMessage buildMessage(SysNotification notification) {
        NotificationMessage message = new NotificationMessage();
        message.setNotificationId(notification.getId());
        message.setUserId(notification.getUserId());
        message.setType(notification.getType());
        message.setTitle(notification.getTitle());
        message.setContent(notification.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setData(Map.of());
        return message;
    }

    private boolean enqueueMessage(SysNotification notification, NotificationMessage message) {
        boolean queued = mqService.sendNotification(message);
        if (queued) {
            notification.setStatus(NotificationSendStatus.QUEUED.getCode());
            notification.setIsRead(ReadStatus.UNREAD.getCode());
            notification.setNextRetryTime(null);
            sysNotificationMapper.updateById(notification);
            return true;
        }
        notification.setStatus(NotificationSendStatus.FAILED.getCode());
        notification.setNextRetryTime(nextRetryTime(notification));
        sysNotificationMapper.updateById(notification);
        return false;
    }

    private LocalDateTime nextRetryTime(SysNotification notification) {
        int sendCount = notification.getSendCount() == null ? 0 : notification.getSendCount();
        int delaySeconds = Math.min(60 * (sendCount + 1), 3600);
        return LocalDateTime.now().plusSeconds(delaySeconds);
    }

    private boolean shouldRetry(SysNotification notification) {
        Integer maxRetryCount = notification.getMaxRetryCount();
        Integer sendCount = notification.getSendCount();
        if (maxRetryCount == null) {
            return true;
        }
        if (sendCount == null) {
            return true;
        }
        return sendCount < maxRetryCount;
    }

    private NotificationVO convertToVO(SysNotification notification) {
        NotificationVO vo = BeanUtil.copyProperties(notification, NotificationVO.class);
        if (notification.getUserId() != null) {
            User user = userMapper.selectById(notification.getUserId());
            if (user != null) {
                vo.setUserName(user.getNickname());
            }
        }
        return vo;
    }
}

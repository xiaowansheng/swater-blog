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
import com.blog.modules.notification.model.message.NotificationMessage;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.notification.model.vo.NotificationVO;
import com.blog.modules.notification.service.NotificationService;
import com.blog.plugin.components.notification.NotificationChannelFactory;
import com.blog.plugin.components.notification.NotificationChannelPlugin;
import com.blog.shared.util.BeanUtil;
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
        notification.setStatus("PENDING");
        notification.setIsRead(0);
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
        notification.setIsRead(1);
        sysNotificationMapper.updateById(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        LambdaUpdateWrapper<SysNotification> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(SysNotification::getUserId, userId)
                .eq(SysNotification::getIsRead, 0)
                .set(SysNotification::getIsRead, 1);
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
        notification.setStatus("QUEUED");
        notification.setIsRead(0);
        sysNotificationMapper.updateById(notification);

        NotificationMessage message = new NotificationMessage();
        message.setNotificationId(notificationId);
        message.setUserId(userId);
        message.setType(type);
        message.setTitle(title);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setData(Map.of());

        boolean queued = mqService.sendNotification(message);
        if (!queued) {
            notification.setStatus("FAILED");
            sysNotificationMapper.updateById(notification);
            log.warn("通知消息入队失败，notificationId: {}", notificationId);
        }
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

            notification.setStatus("SENT");
            notification.setIsRead(0);
            notification.setSentTime(LocalDateTime.now());
            notification.setSendCount(notification.getSendCount() == null ? 1 : notification.getSendCount() + 1);
            sysNotificationMapper.updateById(notification);
        } catch (Exception e) {
            int sendCount = notification.getSendCount() == null ? 0 : notification.getSendCount();
            notification.setSendCount(sendCount + 1);
            notification.setStatus("FAILED");
            sysNotificationMapper.updateById(notification);
            log.error("通知消息处理失败，notificationId: {}", message.getNotificationId(), e);
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

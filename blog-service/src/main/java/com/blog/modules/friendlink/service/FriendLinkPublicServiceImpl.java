package com.blog.modules.friendlink.service;

import com.blog.modules.friendlink.event.FriendLinkCreatedEvent;
import com.blog.modules.friendlink.mapper.FriendLinkMapper;
import com.blog.modules.friendlink.model.dto.FriendLinkApplicationDTO;
import com.blog.modules.friendlink.model.entity.FriendLink;
import com.blog.shared.util.BeanUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 友链申请服务实现（前台访客申请友链使用）
 */
@Slf4j
@Service
public class FriendLinkPublicServiceImpl implements FriendLinkPublicService {

    @Autowired
    private FriendLinkMapper friendLinkMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Long apply(FriendLinkApplicationDTO dto) {
        return apply(dto, null);
    }

    @Override
    @Transactional
    public Long apply(FriendLinkApplicationDTO dto, Long userId) {
        FriendLink friendLink = BeanUtil.copyProperties(dto, FriendLink.class);

        // 设置默认值
        friendLink.setUserId(userId);
        friendLink.setStatus(1);           // 启用状态
        friendLink.setIsVisible(0);         // 未审核前不显示
        friendLink.setReviewStatus(0);      // 待审核状态
        friendLink.setSort(0);

        friendLinkMapper.insert(friendLink);

        // 发布友链申请事件
        eventPublisher.publishEvent(new FriendLinkCreatedEvent(this, friendLink.getId(), friendLink));

        log.info("友链申请已提交，网站名称: {}, URL: {}, 申请人: {}",
                dto.getName(), dto.getUrl(), dto.getAuthor() != null ? dto.getAuthor() : "访客");

        return friendLink.getId();
    }
}

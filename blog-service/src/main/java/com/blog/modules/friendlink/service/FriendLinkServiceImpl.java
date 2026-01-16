package com.blog.modules.friendlink.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.modules.friendlink.mapper.FriendLinkMapper;
import com.blog.modules.friendlink.model.dto.FriendLinkDTO;
import com.blog.modules.friendlink.model.dto.FriendLinkQueryDTO;
import com.blog.modules.friendlink.model.entity.FriendLink;
import com.blog.modules.friendlink.model.vo.FriendLinkVO;
import com.blog.modules.friendlink.event.FriendLinkCreatedEvent;
import com.blog.modules.friendlink.event.FriendLinkApprovedEvent;
import com.blog.shared.util.BeanUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class FriendLinkServiceImpl implements FriendLinkService {
    @Autowired
    private FriendLinkMapper friendLinkMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public List<FriendLinkVO> list(FriendLinkQueryDTO queryDTO) {
        LambdaQueryWrapper<FriendLink> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO != null) {
            if (queryDTO.getId() != null) {
                wrapper.eq(FriendLink::getId, queryDTO.getId());
            }
            if (queryDTO.getUserId() != null) {
                wrapper.eq(FriendLink::getUserId, queryDTO.getUserId());
            }
            if (queryDTO.getName() != null && !queryDTO.getName().trim().isEmpty()) {
                wrapper.like(FriendLink::getName, queryDTO.getName().trim());
            }
            if (queryDTO.getAuthor() != null && !queryDTO.getAuthor().trim().isEmpty()) {
                wrapper.like(FriendLink::getAuthor, queryDTO.getAuthor().trim());
            }
            if (queryDTO.getEmail() != null && !queryDTO.getEmail().trim().isEmpty()) {
                wrapper.like(FriendLink::getEmail, queryDTO.getEmail().trim());
            }
            if (queryDTO.getUrl() != null && !queryDTO.getUrl().trim().isEmpty()) {
                wrapper.like(FriendLink::getUrl, queryDTO.getUrl().trim());
            }
            if (queryDTO.getReviewStatus() != null) {
                wrapper.eq(FriendLink::getReviewStatus, queryDTO.getReviewStatus());
            }
            if (queryDTO.getIsVisible() != null) {
                wrapper.eq(FriendLink::getIsVisible, queryDTO.getIsVisible());
            }
        }
        // 未审核优先（reviewStatus=0），然后按序号升序，最后按创建时间降序
        wrapper.orderByAsc(FriendLink::getReviewStatus)
                .orderByAsc(FriendLink::getSort)
                .orderByDesc(FriendLink::getCreateTime);

        List<FriendLink> friendLinks = friendLinkMapper.selectList(wrapper);
        return friendLinks.stream()
                .map(friendLink -> BeanUtil.copyProperties(friendLink, FriendLinkVO.class))
                .collect(Collectors.toList());
    }

    @Override
    public FriendLinkVO getById(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null) {
            return null;
        }
        return BeanUtil.copyProperties(friendLink, FriendLinkVO.class);
    }

    @Override
    @Transactional
    public Long create(FriendLinkDTO dto) {
        FriendLink friendLink = BeanUtil.copyProperties(dto, FriendLink.class);
        if (friendLink.getIsVisible() == null) {
            friendLink.setIsVisible(0);
        }
        if (friendLink.getReviewStatus() == null) {
            friendLink.setReviewStatus(0);
        }
        if (friendLink.getSort() == null) {
            friendLink.setSort(9999);
        }
        friendLinkMapper.insert(friendLink);

        // 发布友链申请事件
        eventPublisher.publishEvent(new FriendLinkCreatedEvent(this, friendLink.getId(), friendLink));

        return friendLink.getId();
    }

    @Override
    @Transactional
    public void update(Long id, FriendLinkDTO dto) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null) {
            return;
        }
        BeanUtils.copyProperties(dto, friendLink);
        friendLinkMapper.updateById(friendLink);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null) {
            return;
        }
        friendLinkMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void approve(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null) {
            return;
        }
        friendLink.setReviewStatus(1);
        friendLink.setIsVisible(1);
        friendLinkMapper.updateById(friendLink);

        // 发布友链审核通过事件
        eventPublisher.publishEvent(new FriendLinkApprovedEvent(this, friendLink.getId(), friendLink));
    }

    @Override
    @Transactional
    public void reject(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null) {
            return;
        }
        friendLink.setReviewStatus(2);
        friendLink.setIsVisible(0);
        friendLinkMapper.updateById(friendLink);
    }
}

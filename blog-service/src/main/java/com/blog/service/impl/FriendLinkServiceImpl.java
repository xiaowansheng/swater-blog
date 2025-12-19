package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.FriendLinkMapper;
import com.blog.model.dto.FriendLinkDTO;
import com.blog.model.entity.FriendLink;
import com.blog.model.vo.FriendLinkVO;
import com.blog.service.FriendLinkService;
import com.blog.util.BeanUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendLinkServiceImpl implements FriendLinkService {
    @Autowired
    private FriendLinkMapper friendLinkMapper;

    @Override
    public List<FriendLinkVO> list() {
        LambdaQueryWrapper<FriendLink> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FriendLink::getDeleted, 0)
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
        if (friendLink == null || friendLink.getDeleted() == 1) {
            return null;
        }
        return BeanUtil.copyProperties(friendLink, FriendLinkVO.class);
    }

    @Override
    @Transactional
    public Long create(FriendLinkDTO dto) {
        FriendLink friendLink = BeanUtil.copyProperties(dto, FriendLink.class);
        if (friendLink.getStatus() == null) {
            friendLink.setStatus(1);
        }
        if (friendLink.getIsVisible() == null) {
            friendLink.setIsVisible(1);
        }
        if (friendLink.getReviewStatus() == null) {
            friendLink.setReviewStatus(0);
        }
        if (friendLink.getSort() == null) {
            friendLink.setSort(0);
        }
        friendLinkMapper.insert(friendLink);
        return friendLink.getId();
    }

    @Override
    @Transactional
    public void update(Long id, FriendLinkDTO dto) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null || friendLink.getDeleted() == 1) {
            return;
        }
        BeanUtil.copyProperties(dto, friendLink);
        friendLinkMapper.updateById(friendLink);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null || friendLink.getDeleted() == 1) {
            return;
        }
        friendLinkMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void approve(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null || friendLink.getDeleted() == 1) {
            return;
        }
        friendLink.setReviewStatus(1);
        friendLinkMapper.updateById(friendLink);
    }

    @Override
    @Transactional
    public void reject(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null || friendLink.getDeleted() == 1) {
            return;
        }
        friendLink.setReviewStatus(2);
        friendLinkMapper.updateById(friendLink);
    }
}


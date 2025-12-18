package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.mapper.FriendLinkMapper;
import com.blog.model.entity.FriendLink;
import com.blog.model.vo.FriendLinkVO;
import com.blog.service.FriendLinkPublicQueryService;
import com.blog.util.BeanUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendLinkPublicQueryServiceImpl implements FriendLinkPublicQueryService {
    @Autowired
    private FriendLinkMapper friendLinkMapper;

    @Override
    public List<FriendLinkVO> list() {
        LambdaQueryWrapper<FriendLink> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FriendLink::getDeleted, 0)
                .eq(FriendLink::getStatus, 1)
                .eq(FriendLink::getIsVisible, 1)
                .eq(FriendLink::getReviewStatus, 1)
                .orderByAsc(FriendLink::getSort)
                .orderByDesc(FriendLink::getCreateTime);

        List<FriendLink> friendLinks = friendLinkMapper.selectList(wrapper);
        return friendLinks.stream()
                .map(friendLink -> BeanUtil.copyProperties(friendLink, FriendLinkVO.class))
                .collect(Collectors.toList());
    }
}


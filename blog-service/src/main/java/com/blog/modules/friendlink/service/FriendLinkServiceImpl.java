package com.blog.modules.friendlink.service;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.friendlink.mapper.FriendLinkMapper;
import com.blog.modules.friendlink.model.dto.FriendLinkDTO;
import com.blog.modules.friendlink.model.entity.FriendLink;
import com.blog.modules.friendlink.model.vo.FriendLinkVO;
import com.blog.modules.friendlink.service.FriendLinkService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.BeanUtils;
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
        wrapper.orderByAsc(FriendLink::getSort)
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
        friendLinkMapper.updateById(friendLink);
    }

    @Override
    @Transactional
    public void reject(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null) {
            return;
        }
        friendLink.setReviewStatus(2);
        friendLinkMapper.updateById(friendLink);
    }
}


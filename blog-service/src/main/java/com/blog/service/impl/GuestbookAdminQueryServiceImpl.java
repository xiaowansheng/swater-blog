package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.PageResult;
import com.blog.mapper.GuestbookMapper;
import com.blog.mapper.UserMapper;
import com.blog.model.entity.Guestbook;
import com.blog.model.entity.User;
import com.blog.model.vo.GuestbookVO;
import com.blog.service.GuestbookAdminQueryService;
import com.blog.util.BeanUtil;
import com.blog.util.JsonUtil;
import com.blog.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GuestbookAdminQueryServiceImpl implements GuestbookAdminQueryService {
    @Autowired
    private GuestbookMapper guestbookMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<GuestbookVO> list(Long page, Long size, Integer reviewStatus) {
        Page<Guestbook> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Guestbook> wrapper = new LambdaQueryWrapper<>();

        if (reviewStatus != null) {
            wrapper.eq(Guestbook::getReviewStatus, reviewStatus);
        }

        wrapper.orderByDesc(Guestbook::getCreateTime);

        Page<Guestbook> result = guestbookMapper.selectPage(pageParam, wrapper);
        List<GuestbookVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public GuestbookVO getById(Long id) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null || guestbook.getDeleted() == 1) {
            return null;
        }
        return convertToVO(guestbook);
    }

    private GuestbookVO convertToVO(Guestbook guestbook) {
        GuestbookVO vo = BeanUtil.copyProperties(guestbook, GuestbookVO.class);
        if (guestbook.getUserId() != null) {
            User user = userMapper.selectById(guestbook.getUserId());
            if (user != null) {
                vo.setUserName(user.getNickname());
            }
        }
        if (guestbook.getImages() != null && !guestbook.getImages().isEmpty()) {
            try {
                List<String> images = JsonUtil.fromJson(guestbook.getImages(), List.class);
                vo.setImages(images);
            } catch (Exception e) {
                vo.setImages(List.of());
            }
        }
        return vo;
    }
}


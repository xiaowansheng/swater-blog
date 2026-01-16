package com.blog.modules.guestbook.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.guestbook.mapper.GuestbookMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.guestbook.model.entity.Guestbook;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.modules.guestbook.model.dto.GuestbookQueryDTO;
import com.blog.modules.guestbook.service.GuestbookQueryService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class GuestbookQueryServiceImpl implements GuestbookQueryService {
    @Autowired
    private GuestbookMapper guestbookMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public PageResult<GuestbookVO> list(GuestbookQueryDTO queryDTO) {
        Page<Guestbook> pageParam = PageUtil.buildPage(queryDTO.getPage(), queryDTO.getSize());
        LambdaQueryWrapper<Guestbook> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getReviewStatus() != null) {
            wrapper.eq(Guestbook::getReviewStatus, queryDTO.getReviewStatus());
        }
        if (queryDTO.getId() != null) {
            wrapper.eq(Guestbook::getId, queryDTO.getId());
        }
        if (queryDTO.getUserId() != null) {
            wrapper.eq(Guestbook::getUserId, queryDTO.getUserId());
        }
        if (queryDTO.getNickname() != null && !queryDTO.getNickname().trim().isEmpty()) {
            wrapper.like(Guestbook::getNickname, queryDTO.getNickname());
        }
        if (queryDTO.getEmail() != null && !queryDTO.getEmail().trim().isEmpty()) {
            wrapper.like(Guestbook::getEmail, queryDTO.getEmail());
        }
        if (queryDTO.getQq() != null && !queryDTO.getQq().trim().isEmpty()) {
            wrapper.like(Guestbook::getQq, queryDTO.getQq());
        }
        if (queryDTO.getIsVisible() != null) {
            wrapper.eq(Guestbook::getIsVisible, queryDTO.getIsVisible());
        }
        if (queryDTO.getKeyword() != null && !queryDTO.getKeyword().trim().isEmpty()) {
            wrapper.and(w -> w.like(Guestbook::getContent, queryDTO.getKeyword())
                    .or()
                    .like(Guestbook::getNickname, queryDTO.getKeyword())
                    .or()
                    .like(Guestbook::getEmail, queryDTO.getKeyword()));
        }
        if (queryDTO.getCountry() != null && !queryDTO.getCountry().trim().isEmpty()) {
            wrapper.eq(Guestbook::getCountry, queryDTO.getCountry());
        }
        if (queryDTO.getProvince() != null && !queryDTO.getProvince().trim().isEmpty()) {
            wrapper.eq(Guestbook::getProvince, queryDTO.getProvince());
        }
        if (queryDTO.getCity() != null && !queryDTO.getCity().trim().isEmpty()) {
            wrapper.eq(Guestbook::getCity, queryDTO.getCity());
        }
        if (queryDTO.getType() != null && !queryDTO.getType().trim().isEmpty()) {
            wrapper.eq(Guestbook::getType, queryDTO.getType().trim());
        }
        if (queryDTO.getIp() != null && !queryDTO.getIp().trim().isEmpty()) {
            wrapper.eq(Guestbook::getIp, queryDTO.getIp().trim());
        }
        if (queryDTO.getDevice() != null && !queryDTO.getDevice().trim().isEmpty()) {
            wrapper.like(Guestbook::getDevice, queryDTO.getDevice().trim());
        }
        if (queryDTO.getBrowser() != null && !queryDTO.getBrowser().trim().isEmpty()) {
            wrapper.like(Guestbook::getBrowser, queryDTO.getBrowser().trim());
        }
        if (queryDTO.getLocation() != null && !queryDTO.getLocation().trim().isEmpty()) {
            wrapper.like(Guestbook::getLocation, queryDTO.getLocation().trim());
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
        if (guestbook == null) {
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

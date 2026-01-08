package com.blog.modules.guestbook.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.shared.PageResult;
import com.blog.modules.guestbook.mapper.GuestbookMapper;
import com.blog.modules.user.mapper.UserMapper;
import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.modules.guestbook.model.entity.Guestbook;
import com.blog.modules.user.model.entity.User;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.modules.guestbook.service.GuestbookPublicService;
import com.blog.modules.guestbook.service.GuestbookVerificationService;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.JsonUtil;
import com.blog.shared.util.PageUtil;
import com.blog.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class GuestbookPublicServiceImpl implements GuestbookPublicService {
    @Autowired
    private GuestbookMapper guestbookMapper;

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private GuestbookVerificationService guestbookVerificationService;

    @Override
    public PageResult<GuestbookVO> list(Long page, Long size) {
        Page<Guestbook> pageParam = PageUtil.buildPage(page, size);
        LambdaQueryWrapper<Guestbook> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Guestbook::getIsVisible, 1)
                .eq(Guestbook::getReviewStatus, 1)
                .orderByDesc(Guestbook::getCreateTime);

        Page<Guestbook> result = guestbookMapper.selectPage(pageParam, wrapper);
        List<GuestbookVO> voList = result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        return new PageResult<>(voList, result.getTotal(), result.getSize(), result.getCurrent());
    }

    @Override
    public GuestbookVO submit(GuestbookDTO dto) {
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BusinessException(400, "Email is required");
        }
        if (dto.getEmailCode() == null || dto.getEmailCode().trim().isEmpty()) {
            throw new BusinessException(400, "Email code is required");
        }
        guestbookVerificationService.validateEmailCode(dto.getEmail(), dto.getEmailCode());

        Guestbook guestbook = BeanUtil.copyProperties(dto, Guestbook.class);
        
        // Set default values
        guestbook.setIsVisible(1); // Visible by default
        guestbook.setReviewStatus(0); // Pending review
        // Convert images list to JSON string if present
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            guestbook.setImages(JsonUtil.toJson(dto.getImages()));
        }
        
        // Save to database
        guestbookMapper.insert(guestbook);
        
        // Convert to VO and return
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


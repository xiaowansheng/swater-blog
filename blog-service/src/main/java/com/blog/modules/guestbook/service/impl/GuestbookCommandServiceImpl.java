package com.blog.modules.guestbook.service.impl;


import com.blog.modules.guestbook.event.*;
import com.blog.modules.guestbook.mapper.GuestbookMapper;
import com.blog.modules.guestbook.model.entity.Guestbook;
import com.blog.modules.guestbook.model.enums.GuestbookReviewStatus;
import com.blog.modules.guestbook.model.enums.GuestbookVisibilityStatus;
import com.blog.modules.guestbook.service.GuestbookCommandService;
import com.blog.shared.exception.BusinessException;
import com.blog.shared.util.EventUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class GuestbookCommandServiceImpl implements GuestbookCommandService {
    @Autowired
    private GuestbookMapper guestbookMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approve(Long id) {
        Guestbook guestbook = getRequiredGuestbook(id);
        guestbook.setReviewStatus(GuestbookReviewStatus.APPROVED.getCode());
        guestbookMapper.updateById(guestbook);
        
        Guestbook approvedGuestbook = guestbookMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookApprovedEvent(this, id, approvedGuestbook)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long id) {
        Guestbook guestbook = getRequiredGuestbook(id);
        guestbook.setReviewStatus(GuestbookReviewStatus.REJECTED.getCode());
        guestbookMapper.updateById(guestbook);
        
        Guestbook rejectedGuestbook = guestbookMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookRejectedEvent(this, id, rejectedGuestbook)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        getRequiredGuestbook(id);
        guestbookMapper.deleteById(id);
        
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookDeletedEvent(this, id)));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setVisible(Long id, Integer isVisible) {
        GuestbookVisibilityStatus visibilityStatus = GuestbookVisibilityStatus.fromCode(isVisible);
        if (visibilityStatus == null) {
            throw new BusinessException("无效的留言可见状态");
        }

        Guestbook guestbook = getRequiredGuestbook(id);
        guestbook.setIsVisible(visibilityStatus.getCode());
        guestbookMapper.updateById(guestbook);
        
        Guestbook updatedGuestbook = guestbookMapper.selectById(id);
        EventUtil.publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookVisibilityChangedEvent(this, id, updatedGuestbook, visibilityStatus.getCode())));
    }

    private Guestbook getRequiredGuestbook(Long id) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null) {
            throw new BusinessException("留言不存在");
        }
        return guestbook;
    }
}


package com.blog.service.impl;

import com.blog.event.guestbook.*;
import com.blog.mapper.GuestbookMapper;
import com.blog.model.entity.Guestbook;
import com.blog.service.GuestbookAdminCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class GuestbookAdminCommandServiceImpl implements GuestbookAdminCommandService {
    @Autowired
    private GuestbookMapper guestbookMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public void approve(Long id) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null || guestbook.getDeleted() == 1) {
            return;
        }
        guestbook.setReviewStatus(1);
        guestbookMapper.updateById(guestbook);
        
        Guestbook approvedGuestbook = guestbookMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookApprovedEvent(this, id, approvedGuestbook)));
    }

    @Override
    @Transactional
    public void reject(Long id) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null || guestbook.getDeleted() == 1) {
            return;
        }
        guestbook.setReviewStatus(2);
        guestbookMapper.updateById(guestbook);
        
        Guestbook rejectedGuestbook = guestbookMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookRejectedEvent(this, id, rejectedGuestbook)));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null || guestbook.getDeleted() == 1) {
            return;
        }
        guestbookMapper.deleteById(id);
        
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookDeletedEvent(this, id)));
    }

    @Override
    @Transactional
    public void setVisible(Long id, Integer isVisible) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null || guestbook.getDeleted() == 1) {
            return;
        }
        guestbook.setIsVisible(isVisible);
        guestbookMapper.updateById(guestbook);
        
        Guestbook updatedGuestbook = guestbookMapper.selectById(id);
        publishEventAfterCommit(() -> eventPublisher.publishEvent(new GuestbookVisibilityChangedEvent(this, id, updatedGuestbook, isVisible)));
    }

    private void publishEventAfterCommit(Runnable runnable) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                    runnable.run();
                }
            });
        } else {
            runnable.run();
        }
    }
}


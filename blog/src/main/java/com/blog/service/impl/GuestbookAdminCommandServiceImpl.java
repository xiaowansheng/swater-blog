package com.blog.service.impl;

import com.blog.mapper.GuestbookMapper;
import com.blog.model.entity.Guestbook;
import com.blog.service.GuestbookAdminCommandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GuestbookAdminCommandServiceImpl implements GuestbookAdminCommandService {
    @Autowired
    private GuestbookMapper guestbookMapper;

    @Override
    @Transactional
    public void approve(Long id) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null || guestbook.getDeleted() == 1) {
            return;
        }
        guestbook.setReviewStatus(1);
        guestbookMapper.updateById(guestbook);
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
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Guestbook guestbook = guestbookMapper.selectById(id);
        if (guestbook == null || guestbook.getDeleted() == 1) {
            return;
        }
        guestbookMapper.deleteById(id);
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
    }
}


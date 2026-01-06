package com.blog.modules.guestbook.service;


import com.blog.shared.PageResult;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
public interface GuestbookQueryService {
    PageResult<GuestbookVO> list(Long page, Long size, Integer reviewStatus);

    GuestbookVO getById(Long id);
}


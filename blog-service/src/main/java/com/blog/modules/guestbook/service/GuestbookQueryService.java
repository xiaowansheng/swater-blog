package com.blog.modules.guestbook.service;


import com.blog.shared.PageResult;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
import com.blog.modules.guestbook.model.dto.GuestbookQueryDTO;

public interface GuestbookQueryService {
    PageResult<GuestbookVO> list(GuestbookQueryDTO queryDTO);

    GuestbookVO getById(Long id);
}


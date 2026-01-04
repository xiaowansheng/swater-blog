package com.blog.modules.guestbook.service;


import com.blog.common.PageResult;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
public interface GuestbookPublicQueryService {
    PageResult<GuestbookVO> list(Long page, Long size);
}


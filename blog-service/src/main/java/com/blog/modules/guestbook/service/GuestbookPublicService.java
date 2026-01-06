package com.blog.modules.guestbook.service;


import com.blog.shared.PageResult;
import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
public interface GuestbookPublicService {
    PageResult<GuestbookVO> list(Long page, Long size);
    
    GuestbookVO submit(GuestbookDTO dto);
}


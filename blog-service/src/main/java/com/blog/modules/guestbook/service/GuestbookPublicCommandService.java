package com.blog.modules.guestbook.service;


import com.blog.modules.guestbook.model.dto.GuestbookDTO;
import com.blog.modules.guestbook.model.vo.GuestbookVO;
public interface GuestbookPublicCommandService {
    GuestbookVO submit(GuestbookDTO dto);
}


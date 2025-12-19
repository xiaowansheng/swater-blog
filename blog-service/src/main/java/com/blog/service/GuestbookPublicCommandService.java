package com.blog.service;

import com.blog.model.dto.GuestbookDTO;
import com.blog.model.vo.GuestbookVO;

public interface GuestbookPublicCommandService {
    GuestbookVO submit(GuestbookDTO dto);
}


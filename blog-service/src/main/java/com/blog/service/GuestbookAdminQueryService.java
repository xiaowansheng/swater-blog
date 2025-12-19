package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.GuestbookVO;

public interface GuestbookAdminQueryService {
    PageResult<GuestbookVO> list(Long page, Long size, Integer reviewStatus);

    GuestbookVO getById(Long id);
}


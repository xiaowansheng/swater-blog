package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.GuestbookVO;

public interface GuestbookPublicQueryService {
    PageResult<GuestbookVO> list(Long page, Long size);
}


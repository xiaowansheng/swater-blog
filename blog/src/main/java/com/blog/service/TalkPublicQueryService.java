package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.vo.TalkVO;

public interface TalkPublicQueryService {
    PageResult<TalkVO> list(Long page, Long size);

    TalkVO getById(Long id);
}


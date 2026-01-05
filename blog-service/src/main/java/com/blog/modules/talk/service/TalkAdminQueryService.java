package com.blog.modules.talk.service;


import com.blog.shared.PageResult;
import com.blog.modules.talk.model.vo.TalkVO;
public interface TalkAdminQueryService {
    PageResult<TalkVO> list(Long page, Long size);

    TalkVO getById(Long id);
}


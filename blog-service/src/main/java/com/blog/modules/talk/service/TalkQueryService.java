package com.blog.modules.talk.service;


import com.blog.shared.PageResult;
import com.blog.modules.talk.model.vo.TalkVO;
public interface TalkQueryService {
    PageResult<TalkVO> list(Long page, Long size);

    TalkVO getById(Long id);
}


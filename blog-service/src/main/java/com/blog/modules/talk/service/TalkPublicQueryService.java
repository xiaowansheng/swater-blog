package com.blog.modules.talk.service;


import com.blog.common.PageResult;
import com.blog.modules.talk.model.vo.TalkVO;
public interface TalkPublicQueryService {
    PageResult<TalkVO> list(Long page, Long size);

    TalkVO getById(Long id);

    TalkVO getByKey(String key);
}


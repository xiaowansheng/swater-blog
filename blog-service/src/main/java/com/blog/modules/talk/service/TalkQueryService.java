package com.blog.modules.talk.service;


import com.blog.shared.PageResult;
import com.blog.modules.talk.model.dto.TalkQueryDTO;
import com.blog.modules.talk.model.vo.TalkVO;
public interface TalkQueryService {
    PageResult<TalkVO> list(TalkQueryDTO queryDTO);

    TalkVO getById(Long id);
}

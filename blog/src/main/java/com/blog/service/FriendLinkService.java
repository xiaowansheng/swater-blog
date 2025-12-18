package com.blog.service;

import com.blog.common.PageResult;
import com.blog.model.dto.FriendLinkDTO;
import com.blog.model.vo.FriendLinkVO;

import java.util.List;

public interface FriendLinkService {
    List<FriendLinkVO> list();

    FriendLinkVO getById(Long id);

    Long create(FriendLinkDTO dto);

    void update(Long id, FriendLinkDTO dto);

    void delete(Long id);

    void approve(Long id);

    void reject(Long id);
}


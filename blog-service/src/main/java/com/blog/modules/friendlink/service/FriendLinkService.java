package com.blog.modules.friendlink.service;



import com.blog.shared.PageResult;
import com.blog.modules.friendlink.model.dto.FriendLinkDTO;
import com.blog.modules.friendlink.model.vo.FriendLinkVO;
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


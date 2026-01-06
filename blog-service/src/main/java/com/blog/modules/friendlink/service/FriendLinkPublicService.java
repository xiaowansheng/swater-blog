package com.blog.modules.friendlink.service;

import com.blog.modules.friendlink.model.dto.FriendLinkApplicationDTO;

/**
 * 友链申请服务接口（前台访客申请友链使用）
 */
public interface FriendLinkPublicService {

    /**
     * 申请友链
     * 前台访客提交友链申请，默认为待审核状态
     *
     * @param dto 友链申请信息
     * @return 友链ID
     */
    Long apply(FriendLinkApplicationDTO dto);

    /**
     * 申请友链（指定用户）
     * 已登录用户提交友链申请
     *
     * @param dto 友链申请信息
     * @param userId 用户ID
     * @return 友链ID
     */
    Long apply(FriendLinkApplicationDTO dto, Long userId);
}

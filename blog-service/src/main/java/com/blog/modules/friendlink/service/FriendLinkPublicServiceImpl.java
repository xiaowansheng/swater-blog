package com.blog.modules.friendlink.service;

import com.blog.modules.auth.config.EmailSessionProperties;
import com.blog.modules.auth.util.EmailSessionTokenUtil;
import com.blog.modules.friendlink.event.FriendLinkCreatedEvent;
import com.blog.modules.friendlink.mapper.FriendLinkMapper;
import com.blog.modules.friendlink.model.dto.FriendLinkApplicationDTO;
import com.blog.modules.friendlink.model.entity.FriendLink;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.shared.exception.BusinessException;
import com.blog.shared.util.BeanUtil;
import com.blog.shared.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 友链申请服务实现（前台访客申请友链使用）
 */
@Slf4j
@Service
public class FriendLinkPublicServiceImpl implements FriendLinkPublicService {

    @Autowired
    private FriendLinkMapper friendLinkMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private MessageVerificationService messageVerificationService;

    @Autowired
    private EmailSessionProperties emailSessionProperties;

    @Override
    @Transactional
    public Long apply(FriendLinkApplicationDTO dto) {
        // 验证邮箱
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BusinessException(400, "联系邮箱不能为空");
        }

        String ownerEmail = getOwnerEmailFromRequest();
        boolean emailVerifiedBySession = ownerEmail != null && ownerEmail.equalsIgnoreCase(dto.getEmail());
        if (!emailVerifiedBySession) {
            if (dto.getEmailCode() == null || dto.getEmailCode().trim().isEmpty()) {
                throw new BusinessException(400, "邮箱验证码不能为空");
            }
            messageVerificationService.validateEmailCode(dto.getEmail(), dto.getEmailCode());
        }

        return apply(dto, null);
    }

    @Override
    @Transactional
    public Long apply(FriendLinkApplicationDTO dto, Long userId) {
        FriendLink friendLink = BeanUtil.copyProperties(dto, FriendLink.class);

        // 设置默认值
        friendLink.setUserId(userId);
        friendLink.setIsVisible(0);         // 未审核前不显示
        friendLink.setReviewStatus(0);      // 待审核状态
        friendLink.setSort(0);

        friendLinkMapper.insert(friendLink);

        // 发布友链申请事件
        eventPublisher.publishEvent(new FriendLinkCreatedEvent(this, friendLink.getId(), friendLink));

        log.info("友链申请已提交，网站名称: {}, URL: {}, 申请人: {}",
                dto.getName(), dto.getUrl(), dto.getAuthor() != null ? dto.getAuthor() : "访客");

        return friendLink.getId();
    }

    private String getOwnerEmailFromRequest() {
        HttpServletRequest request = RequestUtil.getRequest();
        if (request == null || emailSessionProperties == null) return null;
        String token = request.getHeader(emailSessionProperties.getHeaderName());
        return EmailSessionTokenUtil.getEmail(token, emailSessionProperties);
    }
}

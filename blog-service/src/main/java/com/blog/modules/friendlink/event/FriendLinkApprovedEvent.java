package com.blog.modules.friendlink.event;

import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.friendlink.model.entity.FriendLink;

public class FriendLinkApprovedEvent extends BaseEvent {
    private final Long friendLinkId;
    private final FriendLink friendLink;

    public FriendLinkApprovedEvent(Object source, Long friendLinkId, FriendLink friendLink) {
        super(source, "FRIEND_LINK_APPROVED");
        this.friendLinkId = friendLinkId;
        this.friendLink = friendLink;
    }

    public Long getFriendLinkId() {
        return friendLinkId;
    }

    public FriendLink getFriendLink() {
        return friendLink;
    }
}

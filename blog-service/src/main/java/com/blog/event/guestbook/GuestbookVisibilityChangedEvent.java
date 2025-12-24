package com.blog.event.guestbook;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Guestbook;

public class GuestbookVisibilityChangedEvent extends BaseEvent {
    private final Long guestbookId;
    private final Guestbook guestbook;
    private final Integer isVisible;

    public GuestbookVisibilityChangedEvent(Object source, Long guestbookId, Guestbook guestbook, Integer isVisible) {
        super(source, "GUESTBOOK_VISIBILITY_CHANGED");
        this.guestbookId = guestbookId;
        this.guestbook = guestbook;
        this.isVisible = isVisible;
    }

    public Long getGuestbookId() {
        return guestbookId;
    }

    public Guestbook getGuestbook() {
        return guestbook;
    }

    public Integer getIsVisible() {
        return isVisible;
    }
}


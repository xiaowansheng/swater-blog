package com.blog.modules.guestbook.event;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.guestbook.model.entity.Guestbook;
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


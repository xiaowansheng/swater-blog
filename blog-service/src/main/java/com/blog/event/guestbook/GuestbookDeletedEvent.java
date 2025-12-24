package com.blog.event.guestbook;

import com.blog.event.BaseEvent;

public class GuestbookDeletedEvent extends BaseEvent {
    private final Long guestbookId;

    public GuestbookDeletedEvent(Object source, Long guestbookId) {
        super(source, "GUESTBOOK_DELETED");
        this.guestbookId = guestbookId;
    }

    public Long getGuestbookId() {
        return guestbookId;
    }
}


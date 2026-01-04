package com.blog.modules.guestbook.event;


import com.blog.common.model.event.BaseEvent;
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


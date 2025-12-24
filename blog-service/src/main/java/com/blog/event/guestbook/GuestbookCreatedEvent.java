package com.blog.event.guestbook;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Guestbook;

public class GuestbookCreatedEvent extends BaseEvent {
    private final Long guestbookId;
    private final Guestbook guestbook;

    public GuestbookCreatedEvent(Object source, Long guestbookId, Guestbook guestbook) {
        super(source, "GUESTBOOK_CREATED");
        this.guestbookId = guestbookId;
        this.guestbook = guestbook;
    }

    public Long getGuestbookId() {
        return guestbookId;
    }

    public Guestbook getGuestbook() {
        return guestbook;
    }
}


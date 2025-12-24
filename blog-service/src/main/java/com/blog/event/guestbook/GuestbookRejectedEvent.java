package com.blog.event.guestbook;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Guestbook;

public class GuestbookRejectedEvent extends BaseEvent {
    private final Long guestbookId;
    private final Guestbook guestbook;

    public GuestbookRejectedEvent(Object source, Long guestbookId, Guestbook guestbook) {
        super(source, "GUESTBOOK_REJECTED");
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


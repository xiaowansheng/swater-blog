package com.blog.modules.guestbook.event;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.guestbook.model.entity.Guestbook;
public class GuestbookApprovedEvent extends BaseEvent {
    private final Long guestbookId;
    private final Guestbook guestbook;

    public GuestbookApprovedEvent(Object source, Long guestbookId, Guestbook guestbook) {
        super(source, "GUESTBOOK_APPROVED");
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


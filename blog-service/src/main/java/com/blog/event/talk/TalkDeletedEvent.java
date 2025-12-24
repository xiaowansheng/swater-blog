package com.blog.event.talk;

import com.blog.event.BaseEvent;

public class TalkDeletedEvent extends BaseEvent {
    private final Long talkId;

    public TalkDeletedEvent(Object source, Long talkId) {
        super(source, "TALK_DELETED");
        this.talkId = talkId;
    }

    public Long getTalkId() {
        return talkId;
    }
}


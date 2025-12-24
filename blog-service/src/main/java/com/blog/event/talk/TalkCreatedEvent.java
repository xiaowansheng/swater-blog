package com.blog.event.talk;

import com.blog.event.BaseEvent;
import com.blog.model.entity.Talk;

public class TalkCreatedEvent extends BaseEvent {
    private final Long talkId;
    private final Talk talk;

    public TalkCreatedEvent(Object source, Long talkId, Talk talk) {
        super(source, "TALK_CREATED");
        this.talkId = talkId;
        this.talk = talk;
    }

    public Long getTalkId() {
        return talkId;
    }

    public Talk getTalk() {
        return talk;
    }
}


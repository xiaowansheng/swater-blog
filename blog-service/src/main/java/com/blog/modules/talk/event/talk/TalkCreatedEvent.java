package com.blog.modules.talk.event.talk;


import com.blog.shared.model.event.BaseEvent;
import com.blog.modules.talk.model.entity.Talk;
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


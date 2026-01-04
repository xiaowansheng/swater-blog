package com.blog.modules.talk.event.talk;


import com.blog.common.model.event.BaseEvent;
import com.blog.modules.talk.model.entity.Talk;
public class TalkUpdatedEvent extends BaseEvent {
    private final Long talkId;
    private final Talk talk;

    public TalkUpdatedEvent(Object source, Long talkId, Talk talk) {
        super(source, "TALK_UPDATED");
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


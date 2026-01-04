package com.blog.modules.file.event.file;


import com.blog.common.model.event.BaseEvent;
public class FileDeletedEvent extends BaseEvent {
    private final Long fileId;

    public FileDeletedEvent(Object source, Long fileId) {
        super(source, "FILE_DELETED");
        this.fileId = fileId;
    }

    public Long getFileId() {
        return fileId;
    }
}


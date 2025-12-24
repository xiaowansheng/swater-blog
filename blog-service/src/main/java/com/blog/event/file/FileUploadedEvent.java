package com.blog.event.file;

import com.blog.event.BaseEvent;
import com.blog.model.entity.FileMeta;

public class FileUploadedEvent extends BaseEvent {
    private final Long fileId;
    private final FileMeta fileMeta;

    public FileUploadedEvent(Object source, Long fileId, FileMeta fileMeta) {
        super(source, "FILE_UPLOADED");
        this.fileId = fileId;
        this.fileMeta = fileMeta;
    }

    public Long getFileId() {
        return fileId;
    }

    public FileMeta getFileMeta() {
        return fileMeta;
    }
}


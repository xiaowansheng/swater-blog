package com.blog.mapper;

import com.blog.model.entity.FileReference;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface FileReferenceMapper extends com.blog.mapper.BaseMapper<FileReference> {
    List<FileReference> selectByFileId(@Param("fileId") Long fileId);

    void deleteByFileId(@Param("fileId") Long fileId);

    void deleteByRefTypeAndRefId(@Param("refType") String refType, @Param("refId") Long refId);
}


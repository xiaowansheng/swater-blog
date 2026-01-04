package com.blog.modules.file.mapper;



import com.blog.common.model.BaseMapper;
import com.blog.modules.file.model.entity.FileReference;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface FileReferenceMapper extends com.blog.common.model.BaseMapper<FileReference> {
    List<FileReference> selectByFileId(@Param("fileId") Long fileId);

    void deleteByFileId(@Param("fileId") Long fileId);

    void deleteByRefTypeAndRefId(@Param("refType") String refType, @Param("refId") Long refId);
}


package com.blog.mapper;

import com.blog.model.entity.LogOperation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;

@Mapper
public interface LogOperationMapper extends com.blog.mapper.BaseMapper<LogOperation> {
    void deleteByCreateTimeBefore(@Param("date") LocalDateTime date);
}


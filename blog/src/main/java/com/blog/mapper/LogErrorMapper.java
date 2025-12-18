package com.blog.mapper;

import com.blog.model.entity.LogError;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;

@Mapper
public interface LogErrorMapper extends BaseMapper<LogError> {
    void deleteByCreateTimeBefore(@Param("date") LocalDateTime date);
}


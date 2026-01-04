package com.blog.modules.system.log.mapper;



import com.blog.common.model.BaseMapper;
import com.blog.modules.system.log.model.entity.LogError;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
@Mapper
public interface LogErrorMapper extends com.blog.common.model.BaseMapper<LogError> {
    void deleteByCreateTimeBefore(@Param("date") LocalDateTime date);
}


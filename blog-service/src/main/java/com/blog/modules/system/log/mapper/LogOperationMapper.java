package com.blog.modules.system.log.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.system.log.model.entity.LogOperation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
@Mapper
public interface LogOperationMapper extends com.blog.shared.model.BaseMapper<LogOperation> {
    void deleteByCreateTimeBefore(@Param("date") LocalDateTime date);
}


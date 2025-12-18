package com.blog.mapper;

import com.blog.model.entity.VisitStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface VisitStatisticsMapper extends com.blog.mapper.BaseMapper<VisitStatistics> {
    VisitStatistics selectByTypeIdAndDate(@Param("pageType") String pageType, 
                                           @Param("pageId") String pageId, 
                                           @Param("statisticsDate") java.time.LocalDateTime statisticsDate);
}



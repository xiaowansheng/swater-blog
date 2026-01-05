package com.blog.modules.statistics.statistics.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.statistics.statistics.model.entity.VisitStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
@Mapper
public interface VisitStatisticsMapper extends com.blog.shared.model.BaseMapper<VisitStatistics> {
    VisitStatistics selectByTypeIdAndDate(@Param("pageType") String pageType, 
                                           @Param("pageId") String pageId, 
                                           @Param("statisticsDate") java.time.LocalDateTime statisticsDate);
}


package com.blog.mapper;

import com.blog.model.entity.PageView;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PageViewMapper extends com.blog.mapper.BaseMapper<PageView> {
    void incrementCount(@Param("viewType") String viewType, @Param("viewId") Long viewId);

    PageView selectByTypeAndId(@Param("viewType") String viewType, @Param("viewId") Long viewId);
}


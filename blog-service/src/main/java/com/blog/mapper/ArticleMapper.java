package com.blog.mapper;

import com.blog.model.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArticleMapper extends BaseMapper<Article> {
    List<Article> selectHotArticles(@Param("limit") Integer limit);

    List<Article> selectLatestArticles(@Param("limit") Integer limit);

    List<Article> selectByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);
}


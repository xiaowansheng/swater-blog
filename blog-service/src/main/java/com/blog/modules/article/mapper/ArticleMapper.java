package com.blog.modules.article.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.article.model.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;
@Mapper
public interface ArticleMapper extends com.blog.shared.model.BaseMapper<Article> {
    List<Article> selectHotArticles(@Param("limit") Integer limit);

    List<Article> selectLatestArticles(@Param("limit") Integer limit);

    List<Article> selectByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);

    List<Map<String, Object>> selectArchiveStatistics();

    List<Map<String, Object>> selectAllArchiveStatistics();
}


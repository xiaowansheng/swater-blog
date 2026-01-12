package com.blog.modules.article.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.article.model.entity.Article;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;
import java.util.List;
import java.util.Map;
@Mapper
public interface ArticleMapper extends com.blog.shared.model.BaseMapper<Article> {
    List<Article> selectHotArticles(@Param("limit") Integer limit);

    List<Article> selectLatestArticles(@Param("limit") Integer limit);

    List<Article> selectByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);

    List<Map<String, Object>> selectArchiveStatistics();

    List<Map<String, Object>> selectAllArchiveStatistics();

    @Update("UPDATE article SET view_count = IFNULL(view_count, 0) + 1 WHERE id = #{id} AND deleted = 0")
    int incrementViewCount(@Param("id") Long id);

    @Update("UPDATE article SET like_count = IFNULL(like_count, 0) + 1 WHERE id = #{id} AND deleted = 0")
    int incrementLikeCount(@Param("id") Long id);

    @Update("UPDATE article SET like_count = IF(like_count IS NULL OR like_count <= 0, 0, like_count - 1) WHERE id = #{id} AND deleted = 0")
    int decrementLikeCount(@Param("id") Long id);
}

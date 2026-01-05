package com.blog.modules.article.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.article.model.entity.ArticleTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
@Mapper
public interface ArticleTagMapper extends com.blog.shared.model.BaseMapper<ArticleTag> {
    List<Long> selectTagIdsByArticleId(@Param("articleId") Long articleId);

    List<Long> selectArticleIdsByTagId(@Param("tagId") Long tagId);

    void deleteByArticleId(@Param("articleId") Long articleId);

    List<ArticleTag> selectByArticleIds(@Param("articleIds") List<Long> articleIds);
}


package com.blog.mapper;

import com.blog.model.entity.ArticleTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArticleTagMapper extends BaseMapper<ArticleTag> {
    List<Long> selectTagIdsByArticleId(@Param("articleId") Long articleId);

    List<Long> selectArticleIdsByTagId(@Param("tagId") Long tagId);

    void deleteByArticleId(@Param("articleId") Long articleId);
}


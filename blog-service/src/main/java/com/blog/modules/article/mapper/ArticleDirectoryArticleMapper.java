package com.blog.modules.article.mapper;

import com.blog.modules.article.model.entity.ArticleDirectoryArticle;
import com.blog.shared.model.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ArticleDirectoryArticleMapper extends BaseMapper<ArticleDirectoryArticle> {
    @Select("SELECT COALESCE(MAX(sort), 0) FROM article_directory_article WHERE node_id = #{nodeId}")
    Integer selectMaxSortByNodeId(@Param("nodeId") Long nodeId);
}

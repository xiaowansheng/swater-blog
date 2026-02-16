package com.blog.modules.tag.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.tag.model.entity.Tag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface TagMapper extends com.blog.shared.model.BaseMapper<Tag> {
    @Select("SELECT t.*, count(at.article_id) as article_count " +
            "FROM tag t " +
            "LEFT JOIN article_tag at ON t.id = at.tag_id " +
            "LEFT JOIN article a ON at.article_id = a.id AND a.deleted = 0 " +
            "WHERE t.deleted = 0 " +
            "GROUP BY t.id")
    List<Tag> selectListWithArticleCount();

    @Select("SELECT t.*, count(at.article_id) as article_count " +
            "FROM tag t " +
            "LEFT JOIN article_tag at ON t.id = at.tag_id " +
            "LEFT JOIN article a ON at.article_id = a.id AND a.deleted = 0 AND a.status = 1 " +
            "WHERE t.deleted = 0 AND t.status = 'published' " +
            "GROUP BY t.id")
    List<Tag> selectPublicListWithArticleCount();
}


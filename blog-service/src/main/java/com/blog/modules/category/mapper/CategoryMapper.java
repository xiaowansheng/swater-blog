package com.blog.modules.category.mapper;



import com.blog.shared.model.BaseMapper;
import com.blog.modules.category.model.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface CategoryMapper extends com.blog.shared.model.BaseMapper<Category> {
    @Select("SELECT c.*, count(a.id) as article_count " +
            "FROM category c " +
            "LEFT JOIN article a ON c.id = a.category_id AND a.deleted = 0 " +
            "WHERE c.deleted = 0 " +
            "GROUP BY c.id " +
            "ORDER BY c.sort ASC")
    List<Category> selectListWithArticleCount();

    @Select("SELECT c.*, count(a.id) as article_count " +
            "FROM category c " +
            "LEFT JOIN article a ON c.id = a.category_id AND a.deleted = 0 AND a.status = 1 " +
            "WHERE c.deleted = 0 AND c.status = 'published' " +
            "GROUP BY c.id " +
            "ORDER BY c.sort ASC")
    List<Category> selectPublicListWithArticleCount();
}


package com.blog.modules.article.mapper;

import com.blog.modules.article.model.entity.DirectoryNode;
import com.blog.shared.model.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DirectoryNodeMapper extends BaseMapper<DirectoryNode> {
    @Select("SELECT COALESCE(MAX(sort), 0) FROM directory_node WHERE parent_id = #{parentId} AND deleted = 0")
    Integer selectMaxSortByParentId(@Param("parentId") Long parentId);
}

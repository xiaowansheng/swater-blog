package com.blog.modules.category.service;


import com.blog.modules.category.model.dto.CategoryDTO;
import com.blog.modules.category.model.vo.CategoryVO;
import java.util.List;
public interface CategoryService {
    List<CategoryVO> list();

    List<CategoryVO> listPublic();

    CategoryVO getById(Long id);

    CategoryVO getByKey(String key);

    Long create(CategoryDTO dto);

    void update(Long id, CategoryDTO dto);

    void delete(Long id);

    Long findOrCreateByName(String name);
}


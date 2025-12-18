package com.blog.service;

import com.blog.model.dto.CategoryDTO;
import com.blog.model.vo.CategoryVO;
import java.util.List;

public interface CategoryService {
    List<CategoryVO> list();

    List<CategoryVO> listPublic();

    CategoryVO getById(Long id);

    Long create(CategoryDTO dto);

    void update(Long id, CategoryDTO dto);

    void delete(Long id);
}


package com.blog.service;

import com.blog.model.dto.ApiDTO;
import com.blog.model.vo.ApiVO;

import java.util.List;

public interface ApiService {
    List<ApiVO> list();

    ApiVO getById(Long id);

    Long create(ApiDTO dto);

    void update(Long id, ApiDTO dto);

    void delete(Long id);
}

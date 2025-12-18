package com.blog.service;

import com.blog.model.dto.ApiResourceDTO;
import com.blog.model.vo.ApiResourceVO;

import java.util.List;

public interface ApiResourceService {
    List<ApiResourceVO> list();

    ApiResourceVO getById(Long id);

    void update(Long id, ApiResourceDTO dto);

    void refresh();
}


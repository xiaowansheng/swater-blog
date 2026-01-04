package com.blog.modules.system.api.service;



import com.blog.modules.system.api.model.dto.ApiResourceDTO;
import com.blog.modules.system.api.model.vo.ApiResourceVO;
import java.util.List;
public interface ApiResourceService {
    List<ApiResourceVO> list();

    ApiResourceVO getById(Long id);

    void update(Long id, ApiResourceDTO dto);

    void refresh();
}


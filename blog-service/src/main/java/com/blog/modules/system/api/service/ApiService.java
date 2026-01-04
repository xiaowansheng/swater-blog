package com.blog.modules.system.api.service;



import com.blog.modules.system.api.model.dto.ApiDTO;
import com.blog.modules.system.api.model.vo.ApiVO;
import java.util.List;
public interface ApiService {
    List<ApiVO> list();

    ApiVO getById(Long id);

    Long create(ApiDTO dto);

    void update(Long id, ApiDTO dto);

    void delete(Long id);
}

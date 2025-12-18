package com.blog.service;

import com.blog.model.dto.ConfigDTO;
import com.blog.model.vo.ConfigVO;
import java.util.List;
import java.util.Map;

public interface ConfigService {
    List<ConfigVO> list(String groupName);

    ConfigVO getByKey(String key);

    void updateByKey(String key, String value);

    void updateBatch(Map<String, Object> configs);
}


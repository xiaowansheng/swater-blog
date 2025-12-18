package com.blog.service;

import com.blog.model.vo.ConfigVO;
import java.util.Map;

public interface ConfigPublicService {
    ConfigVO getByKey(String key);

    Map<String, Object> getByGroup(String groupName);
}


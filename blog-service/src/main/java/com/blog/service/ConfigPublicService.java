package com.blog.service;

import com.blog.model.vo.ConfigVO;
import java.util.Map;

public interface ConfigPublicService {
    ConfigVO getByKey(String key);

    Map<String, Object> getByGroup(String groupName);

    /**
     * 获取前台网站所需的所有配置
     * 包括：网站信息、作者信息、封面配置、隐私设置
     */
    Map<String, Object> getSiteConfig();
}


package com.blog.modules.system.config.service;


import com.blog.modules.system.config.model.vo.ConfigVO;
import java.util.Map;
public interface ConfigPublicService {
    ConfigVO getByKey(String key);

    /**
     * 获取前台网站所需的所有配置
     * 包括：网站信息、作者信息、封面配置、社交链接、隐私设置、评论设置、组件配置
     */
    Map<String, Object> getSiteConfig();
}


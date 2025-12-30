package com.blog.service;

import com.blog.model.dto.ConfigDTO;
import com.blog.model.vo.ConfigVO;

import java.util.List;
import java.util.Map;

/**
 * 配置服务接口
 */
public interface ConfigService {

    List<ConfigVO> list(String groupName);

    List<String> getGroups();

    ConfigVO getByKey(String key);

    /**
     * 更新或插入配置信息 (UPSERT)
     * @param key 配置键
     * @param configDTO 配置信息
     * @return 更新后的完整配置数据
     */
    ConfigVO updateByKey(String key, ConfigDTO configDTO);

    void updateBatch(Map<String, Object> configs);
}

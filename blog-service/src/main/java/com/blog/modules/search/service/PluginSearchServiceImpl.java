package com.blog.modules.search.service;


import com.blog.shared.PageResult;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.search.model.vo.SearchVO;
import com.blog.plugin.components.search.SearchPlugin;
import com.blog.plugin.components.search.SearchPluginFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Primary
@Service
public class PluginSearchServiceImpl implements SearchService {

    @Autowired(required = false)
    private SearchPluginFactory searchPluginFactory;

    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size) {
        return search(keyword, type, page, size, null);
    }

    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size, Long categoryId) {
        if (searchPluginFactory == null) {
            throw new BusinessException("未配置搜索插件工厂");
        }
        SearchPlugin plugin = getActivePlugin();
        try {
            return plugin.search(keyword, type, page, size, categoryId);
        } catch (Exception e) {
            throw new BusinessException("搜索执行失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Long> getFacetCounts(String keyword) {
        if (searchPluginFactory == null) {
            return Collections.emptyMap();
        }
        SearchPlugin plugin;
        try {
            plugin = getActivePlugin();
        } catch (BusinessException e) {
            // 无可用插件时 facet 静默为空（搜索主链路已由 search() 报业务异常）
            return Collections.emptyMap();
        }
        try {
            return plugin.getFacetCounts(keyword);
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    /**
     * 获取启用的搜索插件，无可用插件时转换为业务异常（避免 IllegalStateException 直接穿透为 500）
     */
    private SearchPlugin getActivePlugin() {
        try {
            return searchPluginFactory.getActivePlugin();
        } catch (IllegalStateException e) {
            throw new BusinessException("没有可用的搜索插件: " + e.getMessage());
        }
    }
}


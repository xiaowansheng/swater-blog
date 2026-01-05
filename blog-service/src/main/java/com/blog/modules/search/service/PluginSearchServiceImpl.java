package com.blog.modules.search.service;


import com.blog.shared.PageResult;
import com.blog.shared.exception.BusinessException;
import com.blog.modules.search.model.vo.SearchVO;
import com.blog.plugin.components.search.SearchPlugin;
import com.blog.plugin.components.search.SearchPluginFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Primary
@Service
public class PluginSearchServiceImpl implements SearchService {

    @Autowired(required = false)
    private SearchPluginFactory searchPluginFactory;

    @Override
    public PageResult<SearchVO> search(String keyword, String type, Long page, Long size) {
        if (searchPluginFactory == null) {
            throw new BusinessException("未配置搜索插件工厂");
        }
        SearchPlugin plugin = searchPluginFactory.getActivePlugin();
        if (plugin == null) {
            throw new BusinessException("没有可用的搜索插件");
        }
        try {
            return plugin.search(keyword, type, page, size);
        } catch (Exception e) {
            throw new BusinessException("搜索执行失败: " + e.getMessage());
        }
    }
}


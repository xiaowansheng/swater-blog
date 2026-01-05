package com.blog.plugin.components.search;


import com.blog.plugin.core.Plugin;
import com.blog.shared.PageResult;
import com.blog.modules.search.model.vo.SearchVO;

/**
 * 搜索引擎插件接口
 */
public interface SearchPlugin extends Plugin {
    PageResult<SearchVO> search(String keyword, String type, Long page, Long size);

    void indexDocument(String indexType, Long id, String document) throws Exception;

    void deleteDocument(String indexType, Long id) throws Exception;

    void bulkIndexDocuments(String indexType, java.util.List<java.util.Map<String, Object>> documents) throws Exception;
}


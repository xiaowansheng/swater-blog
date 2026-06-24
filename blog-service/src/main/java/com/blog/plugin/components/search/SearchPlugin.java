package com.blog.plugin.components.search;


import com.blog.plugin.core.Plugin;
import com.blog.shared.PageResult;
import com.blog.modules.search.model.vo.SearchVO;

/**
 * 搜索引擎插件接口
 */
public interface SearchPlugin extends Plugin {
    PageResult<SearchVO> search(String keyword, String type, Long page, Long size);

    default PageResult<SearchVO> search(String keyword, String type, Long page, Long size, Long categoryId) {
        return search(keyword, type, page, size);
    }

    default java.util.Map<String, Long> getFacetCounts(String keyword) {
        return java.util.Collections.emptyMap();
    }

    void indexDocument(String indexType, Long id, String document) throws Exception;

    void deleteDocument(String indexType, Long id) throws Exception;

    void bulkIndexDocuments(String indexType, java.util.List<java.util.Map<String, Object>> documents) throws Exception;
}

